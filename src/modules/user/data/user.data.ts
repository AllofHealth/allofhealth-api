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
}

export enum USER_STATUS {
  SUSPENDED = 'SUSPENDED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export enum USER_ROLE {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  PHARMACIST = 'PHARMACIST',
  INSTITUTION = 'INSTITUTION',
}
