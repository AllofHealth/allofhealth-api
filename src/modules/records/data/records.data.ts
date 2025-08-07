export enum RECORDS_ERROR_MESSAGES {
  RECORD_NOT_FOUND = 'Record not found',
  RECORD_ALREADY_EXISTS = 'Record already exists',
  ERROR_CREATING_RECORD = 'Error creating record',
  ERROR_ENCRYPTING_RECORD = 'Error encrypting record',
  ERROR_DECRYPTING_RECORD = 'Error decrypting record',
  PRACTITIONER_NOT_APPROVED_TO_ACCESS_RECORD = 'Practitioner is not approved to access record',
  ERROR_FETCHING_RECORDS = 'Error fetching records',
  RECORD_ACCESS_UNAUTHORIZED = 'Access to record has expired or is unauthorized',
}

export enum RECORDS_SUCCESS_MESSAGES {
  SUCCESS_CREATING_RECORD = 'Record created successfully',
  SUCCESS_FETCHING_RECORDS = 'Records fetched successfully',
  RECORD_ENCRYPTED_SUCCESSFULLY = 'Record encrypted successfully',
  RECORD_DECRYPTED_SUCCESSFULLY = 'Record decrypted successfully',
  RECORD_FETCHED_SUCCESSFULLY = 'Record fetched successfully',
}

export enum RECORDS_STATUS {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ACTIVE = 'active',
}
