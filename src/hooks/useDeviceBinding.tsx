/**
 * @fileoverview Device Binding Hook - Manage device fingerprints for automatic login
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceFingerprint, clearDeviceFingerprint } from '@/utils/deviceFingerprint';
import { useAuth } from '@/hooks/useAuth';

export const useDeviceBinding = () => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);

  console.log('🔐 [useDeviceBinding] Hook initialized/rendered', {
    hasUser: !!user,
    userId: user?.id,
    deviceFingerprint,
    timestamp: new Date().toISOString()
  });

  // Generate device fingerprint on mount
  useEffect(() => {
    console.log('🔐 [useDeviceBinding] useEffect running to init fingerprint');
    const initFingerprint = async () => {
      try {
        console.log('🔐 [useDeviceBinding] Calling getDeviceFingerprint()...');
        const fingerprint = await getDeviceFingerprint();
        console.log('🔐 [useDeviceBinding] Device fingerprint generated:', {
          fingerprint: fingerprint.substring(0, 20) + '...',
          length: fingerprint.length
        });
        setDeviceFingerprint(fingerprint);
        console.log('✅ [useDeviceBinding] Device fingerprint initialized and set in state');
      } catch (error) {
        console.error('❌ [useDeviceBinding] Error generating device fingerprint:', error);
      }
    };

    initFingerprint();
  }, []);

  /**
   * Save device binding after successful login
   * @param userEmail - Optional user email to use. If not provided, uses user from auth context
   */
  const saveDeviceBinding = useCallback(async (userEmail?: string) => {
    // Use provided userEmail or fall back to user from context
    const effectiveEmail = userEmail || user?.email;
    
    console.log('🔐 [Device Binding] Starting saveDeviceBinding:', {
      providedEmail: userEmail,
      contextEmail: user?.email,
      effectiveEmail,
      deviceFingerprint,
      timestamp: new Date().toISOString()
    });
    
    if (!effectiveEmail) {
      console.error('❌ [Device Binding] No user email available!', {
        providedEmail: userEmail,
        contextEmail: user?.email
      });
      return;
    }
    
    if (!deviceFingerprint) {
      console.error('❌ [Device Binding] No device fingerprint available!', {
        deviceFingerprint,
        fingerprintType: typeof deviceFingerprint
      });
      return;
    }

    try {
      // Wait for session to be ready (RLS requires authenticated session)
      console.log('⏳ [Device Binding] Waiting 1 second for session...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const deviceData = {
        user_email: effectiveEmail.toLowerCase().trim(),
        device_fingerprint: deviceFingerprint,
        device_name: navigator.userAgent.substring(0, 100),
        user_agent: navigator.userAgent,
        last_used_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 months
        is_active: true
      };
      
      console.log('💾 [Device Binding] Attempting to save:', {
        ...deviceData,
        user_agent: deviceData.user_agent.substring(0, 50) + '...'
      });

      const { data, error } = await supabase
        .from('device_bindings' as any)
        .upsert(deviceData, {
          onConflict: 'user_email,device_fingerprint'  // CRITICAL: Must match UNIQUE constraint in migration!
        })
        .select();

      if (error) {
        console.error('❌ [Device Binding] Database error:', {
          error,
          errorMessage: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint
        });
        
        // Detailed error handling with solutions
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.error('💡 [Device Binding] TABLE DOES NOT EXIST!');
          console.error('💡 Run this SQL in Supabase Dashboard → SQL Editor:');
          console.error('💡 Copy lines 120-189 from APPLY_THESE_MIGRATIONS.sql');
        } else if (error.code === '42501' || error.message?.includes('policy') || error.message?.includes('permission denied')) {
          console.error('💡 [Device Binding] RLS POLICY BLOCKING INSERT!');
          console.error('💡 Possible causes:');
          console.error('   1. Session not established yet (wait a bit)');
          console.error('   2. User not authenticated');
          console.error('   3. JWT token doesn\'t match user_id');
          console.error('💡 Try: Refresh page and login again');
        } else if (error.message?.includes('violates unique constraint')) {
          console.error('💡 [Device Binding] Unique constraint error');
          console.error('💡 This might mean onConflict clause is wrong');
          console.error('💡 Migration has: UNIQUE(user_email, device_fingerprint)');
          console.error('💡 Code should use: onConflict: "user_email,device_fingerprint"');
        }
      } else {
        console.log('✅✅✅ [Device Binding] SAVED SUCCESSFULLY! ✅✅✅');
        console.log('🎉 Data saved to database:', {
          recordCount: data?.length || 0,
          deviceData: data,
          timestamp: new Date().toISOString()
        });
        console.log('🔍 Check: Supabase Dashboard → Table Editor → device_bindings');
      }
    } catch (error: any) {
      console.error('❌ [Device Binding] Exception:', {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack?.substring(0, 200)
      });
    }
  }, [user, deviceFingerprint]);

  /**
   * Check if device has saved credentials and auto-login
   */
  const checkDeviceBinding = useCallback(async (): Promise<{
    hasBinding: boolean;
    email?: string;
  }> => {
    if (!deviceFingerprint) {
      console.log('⚠️ Device fingerprint not ready');
      return { hasBinding: false };
    }

    setIsChecking(true);

    try {
      console.log('🔍 Checking for device binding...');

      // Find device binding for this fingerprint
      const { data: binding, error } = await supabase
        .from('device_bindings' as any)
        .select('user_email, last_used_at, expires_at, is_active')
        .eq('device_fingerprint', deviceFingerprint)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('last_used_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking device binding:', error);
        return { hasBinding: false };
      }

      if (!binding) {
        console.log('ℹ️ No device binding found for this device');
        return { hasBinding: false };
      }

      // Type assertion for binding data
      const bindingData = binding as any;

      console.log('✅ Device binding found for user:', bindingData.user_email);

      // Update last_used_at
      await supabase
        .from('device_bindings' as any)
        .update({ last_used_at: new Date().toISOString() })
        .eq('device_fingerprint', deviceFingerprint)
        .eq('user_email', bindingData.user_email);

      return {
        hasBinding: true,
        email: bindingData.user_email
      };

    } catch (error) {
      console.error('❌ Exception checking device binding:', error);
      return { hasBinding: false };
    } finally {
      setIsChecking(false);
    }
  }, [deviceFingerprint]);

  /**
   * Remove device binding (logout from this device)
   * @param email - Optional email to remove. If not provided, uses current user email
   */
  const removeDeviceBinding = useCallback(async (email?: string) => {
    const targetEmail = email || user?.email;
    
    if (!targetEmail || !deviceFingerprint) {
      console.warn('⚠️ Cannot remove device binding - missing email or fingerprint');
      return;
    }

    try {
      console.log('🗑️ Removing device binding for:', targetEmail);
      const { error } = await supabase
        .from('device_bindings' as any)
        .delete()
        .eq('user_email', targetEmail.toLowerCase().trim())
        .eq('device_fingerprint', deviceFingerprint);

      if (error) {
        console.error('❌ Error removing device binding:', error);
      } else {
        console.log('✅ Device binding removed successfully');
        clearDeviceFingerprint();
      }
    } catch (error) {
      console.error('❌ Exception removing device binding:', error);
    }
  }, [user, deviceFingerprint]);

  /**
   * Remove all device bindings for current user (logout from all devices)
   */
  const removeAllDeviceBindings = useCallback(async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase
        .from('device_bindings' as any)
        .delete()
        .eq('user_email', user.email.toLowerCase().trim());

      if (error) {
        console.error('❌ Error removing all device bindings:', error);
      } else {
        console.log('✅ All device bindings removed');
        clearDeviceFingerprint();
      }
    } catch (error) {
      console.error('❌ Exception removing all device bindings:', error);
    }
  }, [user]);

  return {
    deviceFingerprint,
    isChecking,
    saveDeviceBinding,
    checkDeviceBinding,
    removeDeviceBinding,
    removeAllDeviceBindings
  };
};

