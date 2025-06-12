import { TRole } from '@/shared/interface/shared.interface';

export interface ICreateDoctor {
  specialization: string;
  medicalLicenseNumber: string;
  scannedLicenseUrl: string;
  yearsOfExperience: number;
  certifications: string[];
  hospitalAssociation: string;
  locationOfHospital: string;
  languagesSpoken: string[];
}

export interface ICreateUser {
  fullName: string;
  emailAddress: string;
  dateOfBirth: Date;
  gender: string;
  phoneNumber: string;
  governmentIdUrl: string;
  specialization?: string;
  medicalLicenseNumber?: string;
  scannedLicenseUrl?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  hospitalAssociation?: string;
  locationOfHospital?: string;
  languagesSpoken?: string[];
  role: TRole;
}
