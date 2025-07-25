import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EOnUserLogin, ESendOtp } from '@/shared/dtos/event.dto';
import { SharedEvents } from '@/shared/events/shared.events';
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

  @OnEvent(SharedEvents.UPDATE_USER_LOGIN)
  async onUserLogin(ctx: EOnUserLogin) {
    return await this.userProvider.updateUser(ctx);
  }

  async findUser(userId: string) {
    return await this.userProvider.findUserById(userId);
  }

  async findUserByEmail(email: string) {
    return await this.userProvider.findUserByEmail(email);
  }

  async fetchDashboardData(userId: string) {
    return await this.userProvider.fetchDashboardData(userId);
  }

  async resendOtp(ctx: ESendOtp) {
    return await this.userProvider.sendOtp(ctx);
  }
}
