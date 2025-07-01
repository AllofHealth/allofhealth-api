import { Injectable } from '@nestjs/common';
import { ICreateUser } from '@/modules/user/interface/user.interface';
import { ILogin } from '../interface/auth.interface';
import { AuthProvider } from '../provider/auth.provider';

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
