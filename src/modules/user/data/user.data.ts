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
  ERROR_FETCHING_DASHBOARD_DATA = 'Error fetching dashboard data',
  DASHBOARD_DATA_NOT_IMPLEMENTED = 'Dashboard data not implemented for this role',
  ERROR_SENDING_EMAIL = 'Error sending otp',
  ERROR_VALIDATING_OTP = 'Error validating otp',
  ERROR_PROCESSING_SUSPENSION_CHECK = 'Error processing suspension check',
  USER_SUSPENDED = 'User is suspended',
  ERROR_FETCHING_PATIENTS = 'Error fetching patients',
  ERROR_DETERMINING_USER_ROLE = 'Error determining user role',
  ERROR_FETCHING_ALL_USERS = 'Error fetching all users',
  ERROR_HANDLING_FORGOT_PASSWORD = 'Error handling forgot password',
  INVALID_EMAIL_ADDRESS = 'Invalid email address',
  ERROR_RESETING_PASSWORD = 'Error resetting password',
  PASSWORD_SAME_AS_OLD = 'Password cannot be the same as the old password',
  ERROR_REINITIALIZING_WALLET = 'Error reinitializing wallet',
}

export enum USER_SUCCESS_MESSAGE {
  USER_CREATED = 'User created successfully',
  USER_FETCHED_SUCCESSFULLY = 'User fetched successfully',
  USER_DELETED_SUCCESSFULLY = 'User deleted successfully',
  USER_UPDATED = 'User updated successfully',
  SUCCESS_FETCHING_DASHBOARD_DATA = 'Dashboard data fetched successfully',
  SUCCESS_SENDING_OTP = 'OTP sent successfully',
  OTP_VALIDATED = 'OTP validated successfully',
  PATIENTS_FETCHED_SUCCESSFULLY = 'Patients fetched successfully',
  USER_ROLE_FETCHED_SUCCESSFULLY = 'User role fetched successfully',
  USERS_FETCHED_SUCCESSFULLY = 'User fetched successfully',
  PASSWORD_RESET_SUCCESSFUL = 'Password reset successful',
}

export enum USER_STATUS {
  SUSPENDED = 'SUSPENDED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export enum USER_ROLE {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  PHARMACIST = 'PHARMACIST',
  INSTITUTION = 'INSTITUTION',
}
