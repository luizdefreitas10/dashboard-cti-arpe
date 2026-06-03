import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PasswordHasher } from '@/domain/users/application/cryptography/password-hasher';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

@Injectable()
export class ScryptPasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scryptAsync(plain, salt, KEY_LENGTH)) as Buffer;
    return `scrypt:${salt}:${derived.toString('hex')}`;
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    const [algorithm, salt, digest] = hashed.split(':');
    if (algorithm !== 'scrypt' || !salt || !digest) return false;

    const derived = (await scryptAsync(plain, salt, KEY_LENGTH)) as Buffer;
    const stored = Buffer.from(digest, 'hex');
    if (stored.length !== derived.length) return false;

    return timingSafeEqual(stored, derived);
  }
}
