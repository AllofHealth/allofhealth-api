import { IAvailability } from '@/modules/availability/interface/availability.interface';
import { TConsultationTypes } from '@/modules/consultation/interface/consultation.interface';
import type { IUserSnippet } from '@/modules/user/interface/user.interface';

export type TSort = 'asc' | 'desc';

export type TOperation = 'inc' | 'dec';

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
  consultationData: {
    consultationOffered: string;
    consultationId: string | null;
  };
  availabilityData: IAvailability;
}

export interface IFetchDoctors {
  page?: number;
  limit?: number;
  sort?: TSort;
  query?: string;
  filter?: TConsultationTypes;
}

export interface IUpdateRecordsReviewed {
  userId: string;
  operation: TOperation;
}
