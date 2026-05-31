// Client-side wallet (Phantom) connect + SIWS sign-in helpers.

export interface SessionUser {
  id: string;
  wallet: string;
  role: string;
  clawb_balance: number;
  discord_username?: string | null;
}

interface SolanaProvider {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array }>;
}

function getProvider(): SolanaProvider | null {
  if (typeof window === "undefined") return null;
  const anyWindow = window as unknown as { solana?: SolanaProvider; phantom?: { solana?: SolanaProvider } };
  return anyWindow.phantom?.solana ?? anyWindow.solana ?? null;
}

function bytesToBase64(bytes: Uint8Array): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str);
}

export class WalletError extends Error {}

export async function fetchSession(): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return null;
  const data = (await res.json()) as { user: SessionUser | null };
  return data.user;
}

export async function signInWithSolana(): Promise<SessionUser> {
  const provider = getProvider();
  if (!provider) {
    throw new WalletError("NO WALLET DETECTED — install Phantom to proceed.");
  }

  const { publicKey } = await provider.connect();
  const wallet = publicKey.toString();

  // 1. Request nonce + message from the system.
  const nonceRes = await fetch("/api/auth/nonce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet }),
  });
  if (!nonceRes.ok) {
    const err = (await nonceRes.json().catch(() => ({}))) as { error?: string };
    throw new WalletError(err.error ?? "Could not issue nonce");
  }
  const { message } = (await nonceRes.json()) as { message: string };

  // 2. Sign the message with the wallet.
  const encoded = new TextEncoder().encode(message);
  const { signature } = await provider.signMessage(encoded, "utf8");
  const signatureBase64 = bytesToBase64(signature);

  // 3. Verify on the server -> sets null_clawb_session cookie.
  const verifyRes = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ wallet, message, signature: signatureBase64 }),
  });
  if (!verifyRes.ok) {
    const err = (await verifyRes.json().catch(() => ({}))) as { error?: string };
    throw new WalletError(err.error ?? "Authentication failed");
  }
  const data = (await verifyRes.json()) as { user: SessionUser };
  return data.user;
}

export async function signOut(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  const provider = getProvider();
  try {
    await provider?.disconnect();
  } catch {
    /* ignore */
  }
}
