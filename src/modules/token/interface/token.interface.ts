export interface ICreateRefreshToken {
  userId: string;
  token: string;
  expiresIn: number;
}

export interface IFindValidToken {
  userId: string;
  token: string;
}

export interface IRevokeToken {
  userId: string;
  replacementToken?: string;
}
