import { IUserSnippet } from '@/modules/user/interface/user.interface';

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
}

export interface IDoctorSnippet extends IUserSnippet {
  specialization: string;
  medicalLicenseNumber: string;
  yearsOfExperience: number;
  certifications: string[];
  hospitalAssociation: string;
  locationOfHospital: string;
  languagesSpoken: string[];
}
