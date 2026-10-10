/**
 * Simple encryption utilities for demo mode API key storage
 * 
 * This provides basic obfuscation to prevent casual observation
 * of API keys in browser storage. This is NOT cryptographically
 * secure and should only be used for demo/playground purposes.
 */

/**
 * Generate a random key for encryption
 */
export function generateKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple XOR encryption (obfuscation)
 * This is NOT secure encryption - it's just to prevent
 * API keys from being stored in plain text
 */
export function encrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(result); // Base64 encode
}

/**
 * Decrypt XOR encrypted text
 */
export function decrypt(encrypted: string, key: string): string {
  try {
    const text = atob(encrypted); // Base64 decode
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  } catch {
    return '';
  }
}

/**
 * Validate API key format
 */
export function isValidApiKey(key: string): boolean {
  // CustomGPT.ai API key format: projectId|apiKey
  // Example: YOUR_CUSTOMGPT_API_KEY
  const trimmedKey = key.trim();
  
  // Check if it contains a pipe character
  if (!trimmedKey.includes('|')) {
    return false;
  }
  
  // Split and validate both parts
  const [projectId, apiKey] = trimmedKey.split('|');
  
  // Project ID should be numeric
  if (!projectId || !/^\d+$/.test(projectId)) {
    return false;
  }
  
  // API key should be alphanumeric (with possible special chars)
  if (!apiKey || apiKey.length < 20) {
    return false;
  }
  
  return true;
}