export enum APPROVAL_ERROR_MESSAGE {
  ERROR_CREATING_APPROVAL = 'Error creating approval',
  RECORD_ID_IS_REQUIRED = 'Record ID is required',
  ERROR_VERIFYING_PRACTITIONER = 'Error verifying practitioner',
  NOT_A_VALID_PRACTITIONER = 'Not a valid practitioner',
  ERROR_FETCHING_DOCTOR_APPROVAL = 'Error fetching doctor approval',
  APPROVALS_NOT_FOUND = 'Approvals not found',
}

export enum APPROVAL_SUCCESS_MESSAGE {
  APPROVAL_CREATED = 'Approval created successfully',
  APPROVAL_FETCHED = 'Approval fetched successfully',
}
