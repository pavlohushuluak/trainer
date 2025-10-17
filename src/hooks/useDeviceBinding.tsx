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
   * @param userId - Optional user ID to use (from login response). If not provided, uses user from auth context
   */
  const saveDeviceBinding = useCallback(async (userId?: string) => {
    // Use provided userId or fall back to user from context
    const effectiveUserId = userId || user?.id;
    
    console.log('🔐 [Device Binding] Starting saveDeviceBinding:', {
      providedUserId: userId,
      contextUserId: user?.id,
      effectiveUserId,
      deviceFingerprint,
      timestamp: new Date().toISOString()
    });
    
    if (!effectiveUserId) {
      console.error('❌ [Device Binding] No user ID available!', {
        providedUserId: userId,
        contextUserId: user?.id,
        contextUserEmail: user?.email
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
      const deviceData = {
        user_id: effectiveUserId,
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
          onConflict: 'device_fingerprint'
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
        
        // Check if it's a table not found error
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.error('💡 [Device Binding] IMPORTANT: The device_bindings table does not exist!');
          console.error('💡 [Device Binding] Please run the migration from: supabase/migrations/20251017120000_create_device_bindings.sql');
          console.error('💡 [Device Binding] Or copy and run the SQL from APPLY_THESE_MIGRATIONS.sql in your Supabase SQL Editor');
        }
      } else {
        console.log('✅ [Device Binding] Saved successfully!', {
          savedData: data,
          timestamp: new Date().toISOString()
        });
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
        .select('user_id, last_used_at, expires_at, is_active')
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

      // Found a valid binding - get user email from subscribers table
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('email')
        .eq('user_id', bindingData.user_id)
        .maybeSingle();
      
      if (subscriberError || !subscriberData?.email) {
        console.error('❌ Error fetching user email for device binding:', subscriberError);
        return { hasBinding: false };
      }

      console.log('✅ Device binding found for user:', subscriberData.email);

      // Update last_used_at
      await supabase
        .from('device_bindings' as any)
        .update({ last_used_at: new Date().toISOString() })
        .eq('device_fingerprint', deviceFingerprint)
        .eq('user_id', bindingData.user_id);

      return {
        hasBinding: true,
        email: subscriberData.email
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
   */
  const removeDeviceBinding = useCallback(async () => {
    if (!user || !deviceFingerprint) return;

    try {
      const { error } = await supabase
        .from('device_bindings' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('device_fingerprint', deviceFingerprint);

      if (error) {
        console.error('❌ Error removing device binding:', error);
      } else {
        console.log('✅ Device binding removed');
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('device_bindings' as any)
        .delete()
        .eq('user_id', user.id);

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

