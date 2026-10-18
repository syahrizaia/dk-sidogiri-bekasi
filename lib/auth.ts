import "server-only";
import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "dk-sidogiri-bekasi-super-secret-key-2026-liquid-glass";
export const AUTH_COOKIE_NAME = "dk_session";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Hash password menggunakan scrypt dengan random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifikasi password terhadap stored salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Buat token sesi terenkripsi / bertanda-tangan HMAC
 */
export function createSessionToken(user: UserSession): string {
  const payload = JSON.stringify({
    ...user,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 hari
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

/**
 * Verifikasi token sesi dan ekstrak user data
 */
export function verifySessionToken(token: string): UserSession | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(encodedPayload)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const jsonString = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const data = JSON.parse(jsonString);

    if (data.exp && Date.now() > data.exp) {
      return null; // Expired
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    };
  } catch {
    return null;
  }
}
