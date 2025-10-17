/**
 * @fileoverview Device Fingerprint - Generate unique device identifier
 * Used for automatic login on trusted devices
 */

/**
 * Generate a device fingerprint based on browser characteristics
 * This creates a semi-unique identifier for the device
 */
export const generateDeviceFingerprint = async (): Promise<string> => {
  const components: string[] = [];

  // Screen information
  components.push(`screen:${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);
  
  // Timezone
  components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  
  // Language
  components.push(`lang:${navigator.language}`);
  
  // Platform
  components.push(`platform:${navigator.platform}`);
  
  // Hardware concurrency (CPU cores)
  components.push(`cores:${navigator.hardwareConcurrency || 'unknown'}`);
  
  // Device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory) {
    components.push(`memory:${deviceMemory}`);
  }
  
  // Canvas fingerprint (more unique)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 100, 50);
      ctx.fillStyle = '#069';
      ctx.fillText('TierTrainer', 2, 2);
      const canvasData = canvas.toDataURL();
      components.push(`canvas:${canvasData.substring(0, 50)}`);
    }
  } catch (e) {
    components.push('canvas:unavailable');
  }
  
  // WebGL fingerprint
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        components.push(`webgl:${vendor}-${renderer}`);
      }
    }
  } catch (e) {
    components.push('webgl:unavailable');
  }

  // User agent
  components.push(`ua:${navigator.userAgent}`);

  // Combine all components and hash
  const fingerprintString = components.join('|');
  
  // Create a simple hash
  const hash = await simpleHash(fingerprintString);
  
  console.log('🔐 Device fingerprint generated:', {
    componentsCount: components.length,
    hash: hash.substring(0, 16) + '...'
  });
  
  return hash;
};

/**
 * Simple hash function using SubtleCrypto
 */
const simpleHash = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Get or create device fingerprint (cached in sessionStorage)
 */
export const getDeviceFingerprint = async (): Promise<string> => {
  // Check if we already have it in this session
  const cached = sessionStorage.getItem('device_fingerprint');
  if (cached) {
    console.log('🔐 Using cached device fingerprint');
    return cached;
  }
  
  // Generate new fingerprint
  const fingerprint = await generateDeviceFingerprint();
  
  // Cache it for this session
  sessionStorage.setItem('device_fingerprint', fingerprint);
  
  return fingerprint;
};

/**
 * Clear device fingerprint from cache
 */
export const clearDeviceFingerprint = (): void => {
  sessionStorage.removeItem('device_fingerprint');
  console.log('🔐 Device fingerprint cleared');
};

