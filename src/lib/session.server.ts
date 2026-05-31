// Server-only helpers for the null_clawb_session JWT (HMAC-SHA256, Web Crypto).
// Not a Supabase session — this is a custom wallet-based session.
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

export const SESSION_COOKIE = "null_clawb_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  sub: string; // user id
  wallet: string;
  role: string;
  iat: number;
  exp: number;
}

const encoder = new TextEncoder();

function getSecret(): string {
  const secret =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!secret) throw new Error("Missing signing secret for null_clawb_session");
  return secret;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeString(input: string): string {
  return base64UrlEncode(encoder.encode(input));
}

function base64UrlDecodeToString(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const decoded = atob(padded + pad);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(data: string): Promise<string> {
  const key = await importKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(sig));
}

export async function createSessionToken(
  user: { id: string; wallet: string; role: string },
): Promise<string> {
  const header = base64UrlEncodeString(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: user.id,
    wallet: user.wallet,
    role: user.role,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const body = base64UrlEncodeString(JSON.stringify(payload));
  const signature = await sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expected = await sign(`${header}.${body}`);
    // constant-time-ish comparison
    if (expected.length !== signature.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    if (diff !== 0) return null;
    const payload = JSON.parse(base64UrlDecodeToString(body)) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;
  return verifySessionToken(token);
}
