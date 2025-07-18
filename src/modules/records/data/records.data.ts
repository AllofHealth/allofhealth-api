export enum RECORDS_ERROR_MESSAGES {
  RECORD_NOT_FOUND = 'Record not found',
  RECORD_ALREADY_EXISTS = 'Record already exists',
  ERROR_CREATING_RECORD = 'Error creating record',
  ERROR_ENCRYPTING_RECORD = 'Error encrypting record',
  ERROR_DECRYPTING_RECORD = 'Error decrypting record',
  PRACTITIONER_NOT_APPROVED_TO_ACCESS_RECORD = 'Practitioner is not approved to access record',
}

export const RECORDS_SUCCESS_MESSAGES = {
  SUCCESS_CREATING_RECORD: 'Record created successfully',
  RECORD_ENCRYPTED_SUCCESSFULLY: 'Record encrypted successfully',
  RECORD_DECRYPTED_SUCCESSFULLY: 'Record decrypted successfully',
};
