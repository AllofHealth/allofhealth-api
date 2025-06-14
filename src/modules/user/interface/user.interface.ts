import { TRole } from '@/shared/interface/shared.interface';
import { Result } from 'neverthrow';
import { UserError } from '../error/user.error';

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
  governmentIdUrl: string;
  specialization?: string;
  medicalLicenseNumber?: string;
  scannedLicenseUrl?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  hospitalAssociation?: string;
  locationOfHospital?: string;
  languagesSpoken?: string[];
  licenseExpirationDate?: Date;
  authProvider: TAuthProvider;
  role: TRole;
}

export interface IUserSnippet {
  userId: string;
  fullName: string;
  email: string;
  profilePicture: string;
  role: string;
  gender: string;
}

export type CreateUserType = Promise<Result<IUserSnippet, UserError>>;
