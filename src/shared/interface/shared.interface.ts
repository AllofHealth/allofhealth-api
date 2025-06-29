import { HttpStatus } from '@nestjs/common';

export interface IHandleReturn<T, D = undefined, M = undefined> {
  status: HttpStatus;
  message: T;
  data?: D;
  meta?: M;
}

export type TRole = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'INSTITUTE' | 'PHARMACIST';

export interface IEncrypt {
  data: string;
  key: string;
}
