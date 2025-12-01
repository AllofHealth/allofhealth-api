import * as crypto from 'crypto';
import { IEncryptCardData } from '../modules/flutterwave/interface/flutterwave.interface';

export function encryptPaymentData(ctx: IEncryptCardData): string {
  const text = JSON.stringify(ctx.data);
  if (!ctx.iv) {
    throw new Error('Missing Flutterwave IV');
  }
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(this.encryptionKey, 'utf8'),
    Buffer.from(ctx.iv, 'utf8'),
  );

  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return encrypted;
}
