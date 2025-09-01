export enum ADMIN_ERROR_MESSAGES {
  ERROR_CREATING_ADMIN = 'Error creating admin',
  ERROR_FINDING_ADMIN = 'Error finding admin',
  ERROR_UPDATING_ADMIN = 'Error updating admin',
  ERROR_DELETING_ADMIN = 'Error deleting admin',
  ERROR_UPDATING_ADMIN_PERMISSIONS = 'Error updating admin permissions',
  ADMIN_NOT_FOUND = 'Admin not found',
  ADMIN_EXISTS = 'admin exists, please login',
  ERROR_VALIDATING_SUPER_ADMIN = 'Error validating super admin',
  ERROR_LOGGING_IN_AS_ADMIN = 'Error logging in as admin',
  INVALID_ADMIN_PASSWORD = 'Invalid admin password',
  ERROR_VERIFYING_PRACTITIONER = 'Error verifying practitioner',
  ERROR_FETCHING_ACTIVE_USERS = 'Error fetching active users',
  ERROR_VALIDATING_SUSPENSION_STATUS = 'Error validating suspension status',
  ERROR_SUSPENDING_USER = 'Error suspending user',
  ERROR_FETCHING_PATIENT_MANAGEMENT_DASHBOARD = 'Error fetching patient management dashboard',
  ERROR_FETCHING_SUSPENDED_USERS = 'Error fetching suspended users',
  ERROR_FETCHING_PATIENT_DATA = 'Error fetching patient data',
  ERROR_FETCHING_DOCTOR_DATA = 'Error fetching doctor data',
  ERROR_FETCHING_USER_DATA = 'Error fetching user data',
  PATIENT_NOT_FOUND = 'Patient not found',
  ERROR_VERIFYING_ADMIN_STATUS = 'Error verifying admin status',
  ERROR_REJECTING_USER = 'Error rejecting user',
}

export enum ADMIN_SUCCESS_MESSAGES {
  SUCCESS_CREATING_ADMIN = 'Admin created successfully',
  ADMIN_FOUND = 'Admin found successfully',
  SUPER_ADMIN_CREATED = 'Super admin created successfully',
  SUCCESS_UPDATING_ADMIN_PERMISSIONS = 'Admin permissions updated successfully',
  SUCCESS_LOGGING_IN_AS_ADMIN = 'Admin logged in successfully',
  PRACTITIONER_VERIFIED = 'Practitioner verified successfully',
  SUCCESS_DELETING_ADMIN = 'Admin deleted successfully',
  USER_ALREADY_SUSPENDED = 'User is already suspended',
  USER_SUSPENDED_SUCCESSFULLY = 'User suspended successfully',
  SUSPENSION_LIFITED_SUCCESSFULLY = 'Suspension lifted successfully',
  PATIENT_MANAGEMENT_DASHBOARD_FETCHED = 'Patient management dashboard fetched successfully',
  USER_DATA_FETCHED = 'User data fetched successfully',
  PATIENT_DATA_FETCHED = 'Patient data fetched successfully',
  DOCTOR_DATA_FETCHED = 'Doctor data fetched successfully',
  USER_REJECTED_SUCCESSFULLY = 'User rejected successfully',
}

export enum ACTIVITY_THRESHOLD {
  ACTIVE = 1000 * 60 * 60 * 24 * 7, //  7 Days
}

export enum SUSPENSION_REASON {
  DEFAULT = 'User violated all of health terms and conditions',
  ACTIVE_SUSPENSION = 'User has been suspended for violating all of health terms and conditions',
}

export enum REJECTION_REASON {
  DEFAULT = 'User has violated some of our authentication terms, please see read our terms and conditions',
}
