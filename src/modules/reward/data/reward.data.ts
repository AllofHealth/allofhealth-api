export enum REWARD_ERROR_MESSAGES {
  NOT_FOUND = 'Reward not found',
  ERROR_CREATING_REWARD = 'Error creating reward',
  ERROR_UPDATING_REWARD = 'Error updating reward',
  ERROR_FETCHING_TOTAL_REWARD_POINTS = 'Error fetcing total earned reward points',
  ERROR_FETCHING_CLAIMED_BALANCE = 'Error fetching claimed balance',
  ERROR_FETCHING_PENDING_REWARDS = 'Error fetching pending rewards',
  ERROR_FETCHING_REWARD_METIRCS = 'Error fetching reward metrics',
  TOKEN_BALANCE_NOT_FOUND = 'Token balance not found',
}

export enum REWARD_SUCCESS_MESSAGES {
  REWARD_CREATED = 'Reward created successfully',
  REWARD_UPDATED = 'Reward updated successfully',
  REWARD_FETCHED = 'Reward fetched successfully',
  REWARD_METRICS_FETCHED = 'Reward metrics fetched successfully',
}

export enum REWARD_CONSTANTS {
  POINTS_PER_REWARD = 50,
  MIN_REWARD = 0.01,
  MAX_REWARD = 0.05,
  MAX_TASK_COUNT = 5,
}
