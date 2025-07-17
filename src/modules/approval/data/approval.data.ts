export enum APPROVAL_ERROR_MESSAGE {
  ERROR_CREATING_APPROVAL = 'Error creating approval',
  RECORD_ID_IS_REQUIRED = 'Record ID is required',
  ERROR_VERIFYING_PRACTITIONER = 'Error verifying practitioner',
  NOT_A_VALID_PRACTITIONER = 'Not a valid practitioner',
  ERROR_FETCHING_DOCTOR_APPROVAL = 'Error fetching doctor approval',
  APPROVAL_NOT_FOUND = 'Approval not found',
  APPROVALS_NOT_FOUND = 'Approvals not found',
  ERROR_ACCEPTING_APPROVAL = 'Error accepting approval',
  ERROR_REJECTING_APPROVAL = 'Error rejecting approval',
  PRACTITIONER_NOT_VERIFIED = 'Practitioner not verified',
  OTP_NOT_VERIFIED = 'OTP not verified',
  APPROVAL_REQUEST_CONFLICT = 'A practitioner is already assigned to this record',
  ERROR_VERIFYING_PATIENT = 'Error verifying patient',
  PATIENT_ONLY = 'Only patients can create approvals',
  APPROVAL_ALREADY_EXISTS = 'Approval already exists with this or another practitioner, please wait till the practitoner updates your record or till approval durartion runs out',
  ERROR_VALIDATING_APPROVAL_ACCESS = 'Error validating approval access',
}

export enum APPROVAL_SUCCESS_MESSAGE {
  APPROVAL_CREATED = 'Approval created successfully',
  APPROVAL_FETCHED = 'Approval fetched successfully',
  APPROVAL_ACCEPTED = 'Approval accepted successfully',
  APPROVAL_REJECTED = 'Approval rejected successfully',
}
