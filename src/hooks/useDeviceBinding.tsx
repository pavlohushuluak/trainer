/**
 * @fileoverview Device Binding Hook - Enforces one account per device
 * Validates device fingerprint and ensures device is only used with one account
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateDeviceFingerprint } from '@/utils/deviceFingerprint';

interface DeviceValidationResult {
  allowed: boolean;
  reason: string;
  message: string;
  boundEmail?: string;
  boundSince?: string;
}

export const useDeviceBinding = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);

  // Generate device fingerprint on mount
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const fingerprint = await getOrCreateDeviceFingerprint();
        setDeviceFingerprint(fingerprint);
        console.log('🔐 Device fingerprint initialized');
      } catch (error) {
        console.error('Error initializing device fingerprint:', error);
      }
    };

    initFingerprint();
  }, []);

  /**
   * Validate if this device can be used with the given user account
   * Call this BEFORE allowing login or signup
   */
  const validateDevice = useCallback(async (
    userEmail: string,
    userId?: string
  ): Promise<DeviceValidationResult> => {
    setIsValidating(true);

    try {
      // Get device fingerprint
      const fingerprint = deviceFingerprint || await getOrCreateDeviceFingerprint();

      console.log('🔐 Validating device for user:', {
        email: userEmail,
        fingerprint: fingerprint.substring(0, 16) + '...'
      });

      // Collect device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString()
      };

      // Call validation function
      const { data, error } = await supabase.functions.invoke('validate-device-binding', {
        body: {
          deviceFingerprint: fingerprint,
          userEmail,
          userId,
          deviceInfo,
          action: 'validate'
        }
      });

      if (error) {
        console.error('❌ Error validating device:', error);
        throw error;
      }

      console.log('🔐 Device validation result:', data);

      if (!data.allowed) {
        console.warn('⚠️ Device not allowed for this account:', data.reason);
      }

      return {
        allowed: data.allowed,
        reason: data.reason,
        message: data.message,
        boundEmail: data.boundEmail,
        boundSince: data.boundSince
      };

    } catch (error) {
      console.error('❌ Exception in device validation:', error);
      
      // In case of error, allow login (fail-open for better UX)
      // But log the error for investigation
      return {
        allowed: true,
        reason: 'VALIDATION_ERROR',
        message: 'Device validation failed - allowing login'
      };
    } finally {
      setIsValidating(false);
    }
  }, [deviceFingerprint]);

  /**
   * Bind this device to a user account
   * Call this AFTER successful login/signup
   */
  const bindDevice = useCallback(async (
    userEmail: string,
    userId: string
  ): Promise<boolean> => {
    console.group('🔐 BINDING DEVICE TO ACCOUNT');
    
    try {
      console.log('Step 1: Getting device fingerprint...');
      const fingerprint = deviceFingerprint || await getOrCreateDeviceFingerprint();
      console.log('✅ Fingerprint:', fingerprint.substring(0, 16) + '...');

      console.log('Step 2: Collecting device info...');
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString()
      };
      console.log('✅ Device info collected');

      const requestBody = {
        deviceFingerprint: fingerprint,
        userEmail,
        userId,
        deviceInfo,
        action: 'bind'
      };
      
      console.log('Step 3: Calling Edge Function...');
      console.log('Request body:', requestBody);

      const { data, error } = await supabase.functions.invoke('validate-device-binding', {
        body: requestBody
      });

      console.log('Step 4: Processing response...');
      console.log('Response data:', data);
      console.log('Response error:', error);

      if (error) {
        console.error('❌ Edge Function returned error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.groupEnd();
        return false;
      }

      if (!data) {
        console.error('❌ No data returned from Edge Function');
        console.groupEnd();
        return false;
      }

      if (!data.success) {
        console.error('❌ Edge Function returned success: false');
        console.error('Reason:', data.reason);
        console.error('Message:', data.message);
        console.groupEnd();
        return false;
      }

      console.log('✅ DEVICE BOUND SUCCESSFULLY!');
      console.log('Details:', data);
      console.groupEnd();
      return true;

    } catch (error) {
      console.error('❌ EXCEPTION in bindDevice:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
      console.groupEnd();
      return false;
    }
  }, [deviceFingerprint]);

  /**
   * Check if device has a bound account and return account info
   * Call this on login page load to enable auto-login
   */
  const getDeviceAccount = useCallback(async (): Promise<{
    bound: boolean;
    email?: string;
    userId?: string;
    message?: string;
  }> => {
    try {
      const fingerprint = deviceFingerprint || await getOrCreateDeviceFingerprint();

      console.log('🔐 Checking for bound account on this device:', {
        fingerprint: fingerprint.substring(0, 16) + '...'
      });

      const { data, error } = await supabase.functions.invoke('get-device-account', {
        body: {
          deviceFingerprint: fingerprint
        }
      });

      if (error) {
        console.error('❌ Error checking device account:', error);
        return { bound: false };
      }

      if (data.bound) {
        console.log('✅ Found bound account:', {
          email: data.email,
          boundSince: data.boundSince
        });
        
        return {
          bound: true,
          email: data.email,
          userId: data.userId,
          message: data.message
        };
      }

      console.log('ℹ️ No bound account found');
      return { bound: false };

    } catch (error) {
      console.error('❌ Exception checking device account:', error);
      return { bound: false };
    }
  }, [deviceFingerprint]);

  return {
    validateDevice,
    bindDevice,
    getDeviceAccount,
    isValidating,
    deviceFingerprint
  };
};

