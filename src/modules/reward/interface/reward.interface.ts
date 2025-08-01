export interface IFetchTotalRewardPoints {
  tokenBalance: string;
}

export interface IFetchClaimedRewards extends IFetchTotalRewardPoints {
  userId: string;
}
