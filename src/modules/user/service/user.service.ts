import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DeleteUser,
  EOnUserLogin,
  ESendOtp,
  EValidateOtp,
} from '@/shared/dtos/event.dto';
import { SharedEvents } from '@/shared/events/shared.events';
import {
  ICreateUser,
  IFetchPatients,
  IFetchUsers,
  IPasswordReset,
  IUpdateUser,
} from '../interface/user.interface';
import { UserProvider } from '../provider/user.provider';

@Injectable()
export class UserService {
  constructor(private readonly userProvider: UserProvider) {}

  async createUser(ctx: ICreateUser) {
    return await this.userProvider.createUser(ctx);
  }

  async updateUser(ctx: IUpdateUser) {
    await this.checkUserSuspension(ctx.userId);
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
    await this.checkUserSuspension(userId);
    return await this.userProvider.fetchDashboardData(userId);
  }

  async resendOtp(ctx: ESendOtp) {
    return await this.userProvider.sendOtp(ctx);
  }

  @OnEvent(SharedEvents.VALIDATE_OTP)
  async validateOtp(ctx: EValidateOtp) {
    return await this.userProvider.validateOtp(ctx.userId);
  }

  async checkUserSuspension(userId: string) {
    return await this.userProvider.handleSuspensionCheck(userId);
  }
  async fetchAllPatients(ctx: IFetchPatients) {
    return await this.userProvider.fetchAllPatients(ctx);
  }

  async fetchAllUsers(ctx: IFetchUsers) {
    return await this.userProvider.fetchAllUsers(ctx);
  }

  async determineUserRole(userId: string) {
    return await this.userProvider.handleDetermineUserRole(userId);
  }

  async deleteUser(ctx: DeleteUser) {
    return await this.userProvider.deleteUser(ctx);
  }

  async forgotPassword(emailAddress: string) {
    return await this.userProvider.handleForgotPassword(emailAddress);
  }

  async resetPassword(ctx: IPasswordReset) {
    return await this.userProvider.handleResetPassword(ctx);
  }

  async endJoyRide(userId: string) {
    return await this.userProvider.endjoyRide(userId);
  }
}
