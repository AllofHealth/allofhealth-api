export interface IFetchTotalRewardPoints {
  tokenBalance: string;
}

export interface IFetchClaimedRewards extends IFetchTotalRewardPoints {
  userId: string;
}

export interface IRewardUsers {
  userId: string;
  amount: number;
}
