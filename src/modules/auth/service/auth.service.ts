import { ICreateUser } from '@/modules/user/interface/user.interface';
import { Injectable } from '@nestjs/common';
import { AuthProvider } from '../provider/auth.provider';

@Injectable()
export class AuthService {
  constructor(private readonly authProvider: AuthProvider) {}

  async handleRegister(ctx: ICreateUser) {
    return await this.authProvider.handleSignup(ctx);
  }
}
