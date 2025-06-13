import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../data/constants';

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
}
