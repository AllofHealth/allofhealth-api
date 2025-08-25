import type { TAuthProvider } from '@/modules/user/interface/user.interface';
import type { TRole } from '@/shared/interface/shared.interface';

export interface IhandleLogin {
  email: string;
  password: string;
}

export interface IRegisterUser {
  userId: string;
  fullName: string;
  email: string;
  profilePicture: string;
  gender: string;
  role: TRole;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IUpdateLastLogin {
  userId: string;
  date: Date;
  authProvider: TAuthProvider;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IGenerateTokens {
  userId: string;
  email: string;
  save?: boolean;
}
