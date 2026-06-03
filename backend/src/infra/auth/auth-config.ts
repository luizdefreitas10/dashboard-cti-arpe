import { generateKeyPairSync } from 'crypto';

interface JwtKeyPair {
  privateKey: string;
  publicKey: string;
}

let developmentKeyPair: JwtKeyPair | null = null;

function normalizeKey(value: string) {
  const trimmed = value.trim();
  if (trimmed.includes('BEGIN')) return trimmed.replace(/\\n/g, '\n');

  try {
    return Buffer.from(trimmed, 'base64')
      .toString('utf8')
      .replace(/\\n/g, '\n');
  } catch {
    return trimmed;
  }
}

export function resolveJwtKeyPair(): JwtKeyPair {
  const privateKey = process.env.AUTH_JWT_PRIVATE_KEY;
  const publicKey = process.env.AUTH_JWT_PUBLIC_KEY;

  if (privateKey && publicKey) {
    return {
      privateKey: normalizeKey(privateKey),
      publicKey: normalizeKey(publicKey),
    };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'AUTH_JWT_PRIVATE_KEY e AUTH_JWT_PUBLIC_KEY são obrigatórios em produção.',
    );
  }

  if (!developmentKeyPair) {
    const pair = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    developmentKeyPair = {
      privateKey: pair.privateKey,
      publicKey: pair.publicKey,
    };
  }

  return developmentKeyPair;
}

export function getSessionDurationMs() {
  const days = Number(process.env.AUTH_SESSION_DAYS ?? 30);
  const safeDays = Number.isFinite(days) && days > 0 ? days : 30;
  return safeDays * 24 * 60 * 60 * 1000;
}

export function getSessionCookieName() {
  return process.env.AUTH_COOKIE_NAME ?? 'cti_session';
}

export function getCookieSameSite(): 'lax' | 'strict' | 'none' {
  const value = process.env.AUTH_COOKIE_SAME_SITE?.toLowerCase();
  if (value === 'strict' || value === 'none') return value;
  return 'lax';
}
