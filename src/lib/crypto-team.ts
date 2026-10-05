/**
 * Zero-Knowledge Team Encryption Utilities
 * Uses WebCrypto API to handle RSA-OAEP and AES-GCM operations.
 */

// Generate a User RSA-OAEP Key Pair (used to receive encrypted team keys)
export async function generateUserKeyPair() {
  return await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export Public Key to Base64 (to store in DB)
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(exported);
}

// Export Private Key to Base64 (to store locally or encrypted in user session)
export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("pkcs8", key);
  return arrayBufferToBase64(exported);
}

// Import Public Key from Base64
export async function importPublicKey(b64: string): Promise<CryptoKey> {
  const binary = base64ToArrayBuffer(b64);
  return await crypto.subtle.importKey(
    "spki",
    binary,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
}

// Import Private Key from Base64
export async function importPrivateKey(b64: string): Promise<CryptoKey> {
  const binary = base64ToArrayBuffer(b64);
  return await crypto.subtle.importKey(
    "pkcs8",
    binary,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
}

// Generate a random AES-GCM Team Key
export async function generateTeamKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt the Team Key with a User's Public Key (RSA-OAEP)
export async function encryptTeamKeyForUser(teamKey: CryptoKey, userPublicKey: CryptoKey): Promise<string> {
  const rawTeamKey = await crypto.subtle.exportKey("raw", teamKey);
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    userPublicKey,
    rawTeamKey
  );
  return arrayBufferToBase64(encrypted);
}

// Decrypt the Team Key with the User's Private Key
export async function decryptTeamKey(encryptedTeamKeyB64: string, userPrivateKey: CryptoKey): Promise<CryptoKey> {
  const encrypted = base64ToArrayBuffer(encryptedTeamKeyB64);
  const rawTeamKey = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    userPrivateKey,
    encrypted
  );
  return await crypto.subtle.importKey(
    "raw",
    rawTeamKey,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

// Utility: ArrayBuffer to Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Utility: Base64 to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
