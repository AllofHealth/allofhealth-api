import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SALT_ROUNDS } from '../data/constants';
import type { IEncrypt } from '../interface/shared.interface';

interface ICompare {
  password: string;
  hashedPassword: string;
}

@Injectable()
export class AuthUtils {
  async hash(password: string) {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(args: ICompare) {
    return await bcrypt.compare(args.password, args.hashedPassword);
  }

  encryptKey(ctx: IEncrypt) {
    const { data, key } = ctx;
    const iv = crypto.randomBytes(16);
    const BufferKey = Buffer.from(key, 'base64');

    const cipher = crypto.createCipheriv('aes-256-cbc', BufferKey, iv);

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decryptKey(ctx: IEncrypt) {
    const { data, key } = ctx;
    const textParts = data.split(':');

    if (textParts.length < 2) {
      throw new Error('Invalid encrypted data format');
    }

    const ivHex = textParts.shift();
    if (!ivHex) {
      throw new Error('Invalid IV in encrypted data');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');

    const BufferKey = Buffer.from(key, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-cbc', BufferKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
