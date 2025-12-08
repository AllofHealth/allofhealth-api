import type { Result } from 'neverthrow';
import type { TRole } from '@/shared/interface/shared.interface';
import type { UserError } from '../error/user.error';
import { IFetchDoctors } from '@/modules/doctor/interface/doctor.interface';
import { IAvailability } from '@/modules/availability/interface/availability.interface';
import { IConsultation } from '@/modules/consultation/interface/consultation.interface';
export type TAuthProvider = 'GOOGLE' | 'CREDENTIALS';
export type TUserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
export type TUserRole = TRole;

export interface ICreateDoctor {
  specialization: string;
  medicalLicenseNumber: string;
  scannedLicenseUrl: string;
  yearsOfExperience: number;
  certifications: string[];
  hospitalAssociation: string;
  locationOfHospital: string;
  languagesSpoken: string[];
  licenseExpirationDate: Date;
}

export interface ICreateUser {
  fullName: string;
  emailAddress: string;
  dateOfBirth: Date;
  gender: string;
  phoneNumber: string;
  password: string;
  governmentIdfilePath?: string;
  bio?: string;
  servicesOffered?: string[];
  specialization?: string;
  medicalLicenseNumber?: string;
  scannedLicensefilePath?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  hospitalAssociation?: string;
  locationOfHospital?: string;
  languagesSpoken?: string[];
  licenseExpirationDate?: Date;
  authProvider?: TAuthProvider;
  role: TRole;
}

export interface IUpdateUser {
  userId: string;
  fullName?: string;
  profilePictureFilePath?: string;
  emailAddress?: string;
  dateOfBirth?: Date;
  gender?: string;
  phoneNumber?: string;
  password?: string;
  bio?: string;
  servicesOffered?: string[];
  specialization?: string;
  medicalLicenseNumber?: string;
  hospitalAssociation?: string;
  locationOfHospital?: string;
  availability?: string;
  yearsOfExperience?: number;
  lastLogin?: Date;
  lastActivity?: Date;
  authProvider?: TAuthProvider;
}

export interface IUserSnippet {
  userId: string;
  fullName: string;
  email: string;
  profilePicture: string;
  phoneNumber?: string;
  role: string;
  gender: string;
  status?: string;
  lastActive?: string;
  availabilityData?: IAvailability[];
  consultationData?: IConsultation;
}

export type CreateUserType = Promise<Result<IUserSnippet, UserError>>;

export interface IHandlePatientRegistration {
  userId: string;
  governmentIdFilePath: string;
}

export interface IHandleDoctorRegistration {
  userId: string;
  governmentIdFilePath: string;
  scannedLicenseFilePath: string;
}

export interface IFetchPatients extends IFetchDoctors {}

export interface IFetchUsers extends IFetchPatients {}

export interface IPasswordReset {
  emailAddress: string;
  password: string;
}

export interface IWalletInfoResponse {
  walletAddress: string;
  balance: string;
  lastUpdated: Date;
}
