import { Injectable } from '@nestjs/common';
import { ICreateUser } from '../interface/user.interface';
import { UserProvider } from '../provider/user.provider';

@Injectable()
export class UserService {
  constructor(private readonly userProvider: UserProvider) {}

  async createUser(ctx: ICreateUser) {
    return await this.userProvider.createUser(ctx);
  }

  async findUser(userId: string) {
    return await this.userProvider.findUserById(userId);
  }
}
