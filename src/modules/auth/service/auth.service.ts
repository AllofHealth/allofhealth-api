import { Injectable } from '@nestjs/common';
import type { ICreateUser } from '@/modules/user/interface/user.interface';
import type { ILogin } from '../interface/auth.interface';
import type { AuthProvider } from '../provider/auth.provider';

@Injectable()
export class AuthService {
  constructor(private readonly authProvider: AuthProvider) {}

  async handleRegister(ctx: ICreateUser) {
    return await this.authProvider.handleSignup(ctx);
  }

  async handleLogin(ctx: ILogin) {
    return await this.authProvider.handleLogin(ctx);
  }
}
