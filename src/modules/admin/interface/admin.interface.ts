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
