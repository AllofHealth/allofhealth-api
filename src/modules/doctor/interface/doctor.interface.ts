export interface ICreateDoctor {
  userId: string;
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
