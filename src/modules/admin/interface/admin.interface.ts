export type TPermissionLevel = 'super' | 'system';

export interface ICreateAdmin {
  userName: string;
  email: string;
  password: string;
  permissionLevel?: TPermissionLevel;
}
