export enum TokenSuccessMessages {
  TOKEN_CREATED = 'Token created successfully',
  FOUND_VALID_TOKEN = 'Valid token found',
  TOKEN_REVOKED = 'Token revoked successfully',
  USER_TOKEN_FOUND = 'User token found',
}

export enum TokenErrorMessages {
  ERROR_CREATING_REFRESH_TOKEN = 'Error creating refresh token',
  ERROR_FINDING_VALID_TOKEN = 'Error finding valid token',
  ERROR_REVOKING_TOKEN = 'Error revoking token',
}
