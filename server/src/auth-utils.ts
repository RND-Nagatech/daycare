import crypto from "node:crypto";

const KEY_LENGTH = 64;
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: string;
  exp: number;
};

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const candidate = crypto.scryptSync(password, salt, KEY_LENGTH);
  const stored = Buffer.from(hash, "hex");
  return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
}

function tokenSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret) throw new Error("AUTH_TOKEN_SECRET is required");
  return secret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", tokenSecret()).update(value).digest("base64url");
}

export function createToken(payload: Omit<AuthTokenPayload, "exp">) {
  const encoded = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE_SECONDS }),
  ).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyToken(token: string): AuthTokenPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AuthTokenPayload;
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}
