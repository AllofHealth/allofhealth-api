export enum HEALTH_INFO_ERROR_MESSAGES {
  HEALTH_INFO_NOT_FOUND = 'Health info not found',
  HEALTH_INFO_ALREADY_EXISTS = 'Health info already exists',
  HEALTH_INFO_INVALID_DATA = 'Invalid health info data',
  ERROR_CREATING_HEALTH_INFO = 'Error creating health info',
  ERROR_UPDATING_HEALTH_INFO = 'Error updating health info',
  ERROR_FETCHING_HEALTH_INFO = 'Error fetching health info',
  UNAUTHORIZED = 'Unauthorized',
  APPROVAL_EXPIRED = 'Approval expired',
  ERROR_VALIDATING_HEALTH_ACCESS = 'Error validating health access',
  HEALTH_INFO_ACCESS_DENIED = 'Health info access denied',
}

export enum HEALTH_INFO_SUCCESS_MESSAGES {
  HEALTH_INFO_CREATED = 'Health info created successfully',
  HEALTH_INFO_UPDATED = 'Health info updated successfully',
  HEALTH_INFO_DELETED = 'Health info deleted successfully',
  HEALTH_INFO_FETCHED = 'Health info fetched successfully',
}
