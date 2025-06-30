export enum USER_ERROR_MESSAGES {
  ERROR_CREATE_USER = 'Error creating user',
  EMAIL_EXIST = 'Email already exist please log in',
  USER_NOT_FOUND = 'User not found',
  USER_EXISTS = 'User already exists',
  ERROR_FETCHING_USER = 'Error fetching user',
  ERROR_DELETING_USER = 'Error deleting user',
  ERROR_UPDATING_USER = 'Error updating user',
  INVALID_ROLE = 'Invalid role',
  ERROR_HANDLING_PATIENT_REGISTRATION = 'Error handling patient registration',
  ERROR_HANDLING_DOCTOR_REGISTRATION = 'Error handling doctor registration',
}

export enum USER_SUCCESS_MESSAGE {
  USER_CREATED = 'User created successfully',
  USER_FETCHED_SUCCESSFULLY = 'User fetched successfully',
  USER_DELETED_SUCCESSFULLY = 'User deleted successfully',
  USER_UPDATED = 'User updated successfully',
}
