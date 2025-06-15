import { Injectable } from '@nestjs/common';
import { ICreateUser, IUpdateUser } from '../interface/user.interface';
import { UserProvider } from '../provider/user.provider';

@Injectable()
export class UserService {
  constructor(private readonly userProvider: UserProvider) {}

  async createUser(ctx: ICreateUser) {
    return await this.userProvider.createUser(ctx);
  }

  async updateUser(ctx: IUpdateUser) {
    return await this.userProvider.updateUser(ctx);
  }

  async findUser(userId: string) {
    return await this.userProvider.findUserById(userId);
  }

  async findUserByEmail(email: string) {
    return await this.userProvider.findUserByEmail(email);
  }
}
