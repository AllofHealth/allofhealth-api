import type { Result } from 'neverthrow';
import type { TRole } from '@/shared/interface/shared.interface';
import type { UserError } from '../error/user.error';
export type TAuthProvider = 'GOOGLE' | 'CREDENTIALS';

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
  governmentIdfilePath: string;
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
