import { ICreateUser } from '@/modules/user/interface/user.interface';
import { Injectable } from '@nestjs/common';
import { AuthProvider } from '../provider/auth.provider';
import { ILogin } from '../interface/auth.interface';

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
