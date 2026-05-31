// Sign In With Solana (CIP-0012 style) message + ed25519 signature verification.
import nacl from "tweetnacl";
import bs58 from "bs58";

const DOMAIN = "null clawb";

export function buildSiwsMessage(wallet: string, nonce: string, issuedAt: string): string {
  return [
    `${DOMAIN} wants you to sign in with your Solana account:`,
    wallet,
    "",
    "CONFIRM YOU ARE NOTHING. Authenticate to access the null clawb OS.",
    "",
    `URI: https://nullclawb.os`,
    `Version: 1`,
    `Chain: solana:mainnet`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function base64ToBytes(b64: string): Uint8Array {
  const decoded = atob(b64);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
  return bytes;
}

/**
 * Verify a base64-encoded ed25519 signature over `message` produced by `wallet`.
 * `wallet` is the base58 Solana public key (as returned by Phantom).
 */
export function verifySiwsSignature(
  wallet: string,
  message: string,
  signatureBase64: string,
): boolean {
  try {
    const publicKey = bs58.decode(wallet);
    if (publicKey.length !== 32) return false;
    const signature = base64ToBytes(signatureBase64);
    if (signature.length !== 64) return false;
    const messageBytes = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(messageBytes, signature, publicKey);
  } catch {
    return false;
  }
}
