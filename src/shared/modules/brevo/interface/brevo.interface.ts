export type TRequest = 'POST' | 'GET' | 'PUT' | 'DELETE';

export interface IGetBrevoOptions {
  method: TRequest;
  body?: Object;
}

export interface ICreateContact {
  emailAddress: string;
}
