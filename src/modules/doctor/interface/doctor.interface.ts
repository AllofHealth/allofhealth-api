import type { IUserSnippet } from '@/modules/user/interface/user.interface';

export type TSort = 'asc' | 'desc';

export interface ICreateDoctor {
  userId: string;
  specialization: string;
  medicalLicenseNumber: string;
  yearsOfExperience: number;
  certifications?: string[];
  hospitalAssociation: string;
  locationOfHospital: string;
  languagesSpoken: string[];
  licenseExpirationDate: Date;
  bio?: string;
  servicesOffered?: string[];
}

export interface IDoctorSnippet extends IUserSnippet {
  bio: string;
  servicesOffered: string[];
  specialization: string;
  medicalLicenseNumber: string;
  yearsOfExperience: number;
  certifications: string[];
  hospitalAssociation: string;
  locationOfHospital: string;
  languagesSpoken: string[];
  availability: string;
  isVerified: boolean;
}

export interface IFetchDoctors {
  page?: number;
  limit?: number;
  sort?: TSort;
  query?: string;
}
