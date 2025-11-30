import { Injectable } from '@nestjs/common';
import {
  IAdminLogin,
  ICreateAdmin,
  ICreateSystemAdmin,
  IDeleteAdmin,
  IFetchApprovalManagementData,
  IHandleIsUserRejected,
  IManagePermissions,
  IRejectUser,
  ISuspendUser,
  IVerifyPractitioner,
} from '../interface/admin.interface';
import { AdminProvider } from '../provider/admin.provider';
import { IFetchDoctors } from '@/modules/doctor/interface/doctor.interface';
import {
  IFetchPatients,
  IFetchUsers,
} from '@/modules/user/interface/user.interface';
import { IFetchAllContacts } from '@/shared/modules/brevo/interface/brevo.interface';
import { IFetchAllBookings } from '@/modules/booking/interface/booking.interface';

@Injectable()
export class AdminService {
  constructor(private readonly adminProvider: AdminProvider) {}

  async createSuperAdmin(ctx: ICreateAdmin) {
    return await this.adminProvider.createSuperAdmin(ctx);
  }

  async createSystemAdmin(ctx: ICreateSystemAdmin) {
    return await this.adminProvider.createSystemAdmin(ctx);
  }

  async managePermissions(ctx: IManagePermissions) {
    return await this.adminProvider.managePermissions(ctx);
  }

  async adminLogin(ctx: IAdminLogin) {
    return await this.adminProvider.adminLogin(ctx);
  }

  async verifyPractitioner(ctx: IVerifyPractitioner) {
    return await this.adminProvider.verifyPractitioner(ctx);
  }
  async deleteAdmin(ctx: IDeleteAdmin) {
    return await this.adminProvider.deleteAdmin(ctx);
  }

  async suspendUser(ctx: ISuspendUser) {
    return await this.adminProvider.suspendUser(ctx);
  }

  async fetchPatientManagementDashboardData() {
    return await this.adminProvider.fetchPatientManagementDashboard();
  }

  async fetchAllDoctors(ctx: IFetchDoctors) {
    return await this.adminProvider.fetchAllDoctors(ctx);
  }

  async fetchAllPatients(ctx: IFetchPatients) {
    return await this.adminProvider.fetchAllPatients(ctx);
  }

  async fetchAllUsers(ctx: IFetchUsers) {
    return await this.adminProvider.fetchAllUsers(ctx);
  }

  async fetchUserData(userId: string) {
    return await this.adminProvider.fetchUserData(userId);
  }

  async determineIsAdmin(emailAddress: string) {
    return await this.adminProvider.determineIsAdmin(emailAddress);
  }

  async rejectUser(ctx: IRejectUser) {
    return await this.adminProvider.rejectUser(ctx);
  }

  async verifyRejectionStatus(ctx: IHandleIsUserRejected) {
    return await this.adminProvider.handleIsUserRejected(ctx);
  }

  async fetchApprovalManagementData(ctx: IFetchApprovalManagementData) {
    return await this.adminProvider.fetchApprovalManagementData(ctx);
  }

  async deleteUser(userId: string) {
    return await this.adminProvider.deleteUser(userId);
  }

  async revokeSuspension(userId: string) {
    return await this.adminProvider.revokeSuspension(userId);
  }

  async deleteMoodMetrics(userId: string) {
    return await this.adminProvider.deleteUserMoodMetrics(userId);
  }

  async deleteUserHealthJournal(userId: string) {
    return await this.adminProvider.clearUserHealthJournal(userId);
  }

  async fetchNewsletterSubscribers(ctx: IFetchAllContacts) {
    return await this.adminProvider.fetchAllSubscribers(ctx);
  }

  async fetchAllBookings(ctx: IFetchAllBookings) {
    return await this.adminProvider.fetchAllBookings(ctx);
  }
}
