/**
 * @fileoverview Device Fingerprinting - Creates unique device identifier
 * Used to bind one account to one device permanently for security
 */

/**
 * Generate a unique device fingerprint based on browser and device characteristics
 * This creates a semi-permanent identifier that persists across sessions
 */
export const generateDeviceFingerprint = async (): Promise<string> => {
  const components: string[] = [];

  // 1. Screen resolution and color depth
  components.push(`screen:${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);
  
  // 2. Timezone
  components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  
  // 3. Language
  components.push(`lang:${navigator.language}`);
  
  // 4. Platform
  components.push(`platform:${navigator.platform}`);
  
  // 5. User agent
  components.push(`ua:${navigator.userAgent}`);
  
  // 6. Hardware concurrency (CPU cores)
  components.push(`cores:${navigator.hardwareConcurrency || 'unknown'}`);
  
  // 7. Device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory) {
    components.push(`mem:${deviceMemory}`);
  }
  
  // 8. Touch support
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  components.push(`touch:${maxTouchPoints}`);
  
  // 9. Canvas fingerprint (more stable)
  const canvasFingerprint = getCanvasFingerprint();
  components.push(`canvas:${canvasFingerprint}`);
  
  // 10. WebGL fingerprint
  const webglFingerprint = getWebGLFingerprint();
  if (webglFingerprint) {
    components.push(`webgl:${webglFingerprint}`);
  }

  // Combine all components
  const fingerprintString = components.join('|');
  
  // Hash the fingerprint for consistent length and privacy
  const hash = await hashString(fingerprintString);
  
  console.log('🔐 Device fingerprint generated:', {
    hash: hash.substring(0, 16) + '...',
    components: components.length
  });
  
  return hash;
};

/**
 * Get canvas fingerprint for more stable device identification
 */
const getCanvasFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return 'no-canvas';
    
    // Draw unique text
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('TierTrainer Device ID', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('TierTrainer Device ID', 4, 17);
    
    // Get canvas data
    const dataURL = canvas.toDataURL();
    
    // Return a hash of the canvas data
    return simpleHash(dataURL);
  } catch (error) {
    console.error('Error generating canvas fingerprint:', error);
    return 'canvas-error';
  }
};

/**
 * Get WebGL fingerprint for additional device identification
 */
const getWebGLFingerprint = (): string | null => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return null;
    
    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return null;
    
    const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    return `${vendor}|${renderer}`;
  } catch (error) {
    return null;
  }
};

/**
 * Simple hash function for canvas fingerprinting
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

/**
 * Hash a string using SubtleCrypto API
 */
const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Store device fingerprint in localStorage
 */
export const storeDeviceFingerprint = (fingerprint: string): void => {
  try {
    localStorage.setItem('device_fingerprint', fingerprint);
    localStorage.setItem('device_fingerprint_created', new Date().toISOString());
    console.log('🔐 Device fingerprint stored');
  } catch (error) {
    console.error('Error storing device fingerprint:', error);
  }
};

/**
 * Get stored device fingerprint from localStorage
 */
export const getStoredDeviceFingerprint = (): string | null => {
  try {
    return localStorage.getItem('device_fingerprint');
  } catch (error) {
    console.error('Error getting device fingerprint:', error);
    return null;
  }
};

/**
 * Get or create device fingerprint
 * Returns existing fingerprint if found, otherwise creates new one
 */
export const getOrCreateDeviceFingerprint = async (): Promise<string> => {
  // Try to get existing fingerprint
  const existing = getStoredDeviceFingerprint();
  
  if (existing) {
    console.log('🔐 Using existing device fingerprint');
    return existing;
  }
  
  // Generate new fingerprint
  console.log('🔐 Generating new device fingerprint');
  const fingerprint = await generateDeviceFingerprint();
  storeDeviceFingerprint(fingerprint);
  
  return fingerprint;
};

