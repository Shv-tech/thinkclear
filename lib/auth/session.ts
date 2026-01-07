import crypto from 'crypto';

export function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string) {
  return crypto
    .createHmac('sha256', process.env.SESSION_SECRET!)
    .update(token)
    .digest('hex');
}
