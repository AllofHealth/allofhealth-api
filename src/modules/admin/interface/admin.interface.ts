export type TPermissionLevel = 'super' | 'system';
export type TPractitionerRole = 'doctor' | 'pharmacist';

export interface ICreateAdmin {
  userName: string;
  email: string;
  password: string;
  permissionLevel?: TPermissionLevel;
}

export interface ICreateSystemAdmin extends ICreateAdmin {
  superAdminId: string;
}

export interface IManagePermissions {
  superAdminId: string;
  adminId: string;
  permissionLevel: TPermissionLevel;
}

export interface IAdminLogin {
  email: string;
  password: string;
}

export interface IVerifyPractitioner {
  practitionerId: string;
  role: TPractitionerRole;
}

export interface IDeleteAdmin {
  superAdminId: string;
  adminId: string;
}

export interface IDetermineActivityStatus {
  lastActive: Date;
  timestamp?: Date;
}

export interface ISuspendUser {
  userId: string;
  reason?: string;
}

export interface IIdentityAssets {
  governmentIdUrl: string;
  medicalLicenseUrl?: string;
}

export interface IPatientActivity {
  appointmentsBooked: number;
  medicalRecordsCreated: number;
}

export interface IDoctorActivity {
  patientsAttended: number;
  recordsReviewed: number;
  pendingApprovals: number;
}

export interface IInspectPatientResponse {
  userId: string;
  fullName: string;
  profilePicture: string;
  emailAddress: string;
  phoneNumber: string;
  gender: string;
  status: string;
  lastActive: string;
  dateJoined: string;
  dob: string;
  role: string;
  identityAssets: IIdentityAssets;
  patientActivity: IPatientActivity;
}

export interface IInspectDoctorResponse {
  userId: string;
  fullName: string;
  profilePicture: string;
  emailAddress: string;
  phoneNumber: string;
  gender: string;
  status: string;
  lastActive: string;
  dateJoined: string;
  dob: string;
  role: string;
  medicalLicenseNumber: string;
  yearsOfExperience: number;
  hospitalAffiliation: string;
  bio: string;
  languagesSpoken: string[];
  certifications: string[];
  servicesOffered: string[];
  identityAssets: IIdentityAssets;
  doctorActivity: IDoctorActivity;
}
