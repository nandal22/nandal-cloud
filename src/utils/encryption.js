/**
 * Client-side AES-256-GCM encryption using TweetNaCl (secretbox = XSalsa20-Poly1305)
 * All encryption/decryption happens in the browser — keys never leave the client.
 */
import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util'

/**
 * Derive a 32-byte key from a password using PBKDF2-SHA256
 */
export async function deriveKey(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial, 256
  )
  return new Uint8Array(bits)
}

/**
 * Encrypt a Uint8Array with a 32-byte key using nacl.secretbox
 * Returns base64-encoded string: nonce(24) + ciphertext
 */
export function encryptBytes(data, key) {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
  const box = nacl.secretbox(data, nonce, key)
  const combined = new Uint8Array(nonce.length + box.length)
  combined.set(nonce)
  combined.set(box, nonce.length)
  return encodeBase64(combined)
}

/**
 * Decrypt a base64-encoded string produced by encryptBytes
 */
export function decryptBytes(encoded, key) {
  const combined = decodeBase64(encoded)
  const nonce = combined.slice(0, nacl.secretbox.nonceLength)
  const box = combined.slice(nacl.secretbox.nonceLength)
  const decrypted = nacl.secretbox.open(box, nonce, key)
  if (!decrypted) throw new Error('Decryption failed — wrong key or tampered data')
  return decrypted
}

/**
 * Encrypt a plain text string, returns base64
 */
export function encryptText(text, key) {
  return encryptBytes(encodeUTF8(text), key)
}

/**
 * Decrypt a base64 string back to plain text
 */
export function decryptText(encoded, key) {
  return decodeUTF8(decryptBytes(encoded, key))
}

/**
 * Encrypt a File object, returns a new Blob with the encrypted data
 */
export async function encryptFile(file, key) {
  const buffer = await file.arrayBuffer()
  const data = new Uint8Array(buffer)
  const encrypted = encryptBytes(data, key)
  return new Blob([encrypted], { type: 'application/octet-stream' })
}

/**
 * Decrypt an encrypted Blob back to the original Uint8Array
 */
export async function decryptFile(blob, key) {
  const text = await blob.text()
  return decryptBytes(text, key)
}

/**
 * Generate a random 32-byte key (for new vaults)
 */
export function generateKey() {
  return nacl.randomBytes(32)
}

/**
 * Encode/decode key to/from base64 for storage
 */
export const keyToBase64 = (key) => encodeBase64(key)
export const keyFromBase64 = (b64) => decodeBase64(b64)
