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
}

export enum ADMIN_SUCCESS_MESSAGES {
  SUCCESS_CREATING_ADMIN = 'Admin created successfully',
  ADMIN_FOUND = 'Admin found successfully',
  SUPER_ADMIN_CREATED = 'Super admin created successfully',
  SUCCESS_UPDATING_ADMIN_PERMISSIONS = 'Admin permissions updated successfully',
  SUCCESS_LOGGING_IN_AS_ADMIN = 'Admin logged in successfully',
  PRACTITIONER_VERIFIED = 'Practitioner verified successfully',
}
