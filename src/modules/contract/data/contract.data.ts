export enum ContractErrorMessages {
  ERROR_PROVIDING_CONTRACT = 'Error providing contract',
  ERROR_PROVIDING_SYSTEM_ADMIN_COUNT = 'Error providing system admin count',
  ERROR_REGISTERING_PATIENT = 'Error registering patient',
  ERROR_REGISTERING_DOCTOR = 'Error registering doctor',
  ERROR_PROVIDING_PATIENT_COUNT = 'Error providing patiesnt count',
  ERROR_FETCHING_PATIENT_ID = 'Error fetching patient ID',
  ERROR_FETCHING_DOCTOR_ID = 'Error fetching doctor ID',
  ERROR_APPROVING_ADD_NEW_RECORD = 'Error approving add new record',
  ERROR_VERIFYING_NEW_RECORD_WRITE_PERMISSION = 'Error verifying new record write permission',
  ERROR_APPROVING_RECORD_ACCESS = 'Error approving record access',
  ERROR_VERIFYING_PRACTITIONER_ACCESS = 'Error verifying if practitioner has access to medical record ',
  RECORD_ID_REQUIRED = 'Record ID is required',
  ERROR_ADDING_MEDICAL_RECORD = 'Error adding medical record',
  ERROR_MINTING_TOKEN = 'Error minting token',
  ERROR_FETCHING_TOKEN_BALANCE = 'Error fetching token balance',
  ERROR_VIEWING_MEDICAL_RECORD = 'Error viewing medical record',
  ERROR_PROCESSING_BATCH_VIEW_MEDICAL_RECORDS = 'Error processing batch view medical record',
  ERROR_NO_ACCESS_TO_RECORD = 'No access to record',
  ERROR_LOGGING_CONTRACT_FAILURE = 'Error logging contract registration failure',
}

export enum ContractSuccessMessages {
  TX_EXECUTED_SUCCESSFULLY = 'Transaction executed successfully',
  PATIENT_REGISTERED_SUCCESSFULLY = 'Patient registered successfully',
  DOCTOR_REGISTERED_SUCCESSFULLY = 'Doctor registered successfully',
  PATIENT_ID_FETCHED_SUCCESSFULLY = 'Patient ID fetched successfully',
  DOCTOR_ID_FETCHED_SUCCESSFULLY = 'Doctor ID fetched successfully',
  DOCTOR_APPROVED_SUCCESSFULLY_TO_ADD_NEW_RECORD = 'Doctor approved successfully to add new record',
  NEW_RECORD_WRITE_PERMISSION_VERIFIED = 'New record write permission verified',
  DOCTOR_ALREADY_APPROVED = 'Doctor already approved to add new medical record',
  RECORD_ACCESS_APPROVED = 'Record access approved successfully',
  VIEW_ACCESS_ALREADY_APPROVED = 'View access already approved',
  FULL_RECORD_ACCESS_APPROVED = 'Full record access approved successfully',
  READ_ACCESS_APPROVED = 'Read access approved successfully',
  WRITE_ACCESS_APPROVED = 'Write access approved successfully',
  MEDICAL_RECORD_ADDED_SUCCESSFULLY = 'Medical record added successfully',
  TOKEN_MINTED_SUCCESSFULLY = 'Token minted successfully',
  TOKEN_BALANCE_FETCHED_SUCCESSFULLY = 'Token balance fetched successfully',
  MEDICAL_RECORD_FETCHED_SUCCESSFULLY = 'Medical record fetched successfully',
}

export enum Duration {
  A_DAY = 86400000,
}

export enum RewardAmount {
  MIN = 10000000000000000, //0.01 in wei
}

export const ABI = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    name: 'addDoctorToHospital',
    inputs: [
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: '_hospitalId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addMedicalRecord',
    inputs: [
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_patientAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: '_patientId', type: 'uint256', internalType: 'uint256' },
      {
        name: '_recordDetailsUri',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addMedicalRecordForFamilyMember',
    inputs: [
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_principalPatientId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_familyMemberId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_recordDetailsUri',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addPatient',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addPatientFamilyMember',
    inputs: [
      {
        name: '_principalPatientId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addPharmacistToHospital',
    inputs: [
      {
        name: '_pharmacistAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: '_hospitalId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addSystemAdmin',
    inputs: [{ name: '_admin', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveAccessToAddNewRecord',
    inputs: [
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: '_patientId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveAccessToAddNewRecordForFamilyMember',
    inputs: [
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: '_patientId', type: 'uint256', internalType: 'uint256' },
      {
        name: '_principalPatientId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveFamilyMemberMedicalRecordAccess',
    inputs: [
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_principalPatientId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_familyMemberId',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: '_recordId', type: 'uint256', internalType: 'uint256' },
      { name: '_duration', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveHospital',
    inputs: [{ name: '_hospitalId', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveMedicalRecordAccess',
    inputs: [
      {
        name: '_practitionerAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: '_patientId', type: 'uint256', internalType: 'uint256' },
      { name: '_recordId', type: 'uint256', internalType: 'uint256' },
      { name: '_duration', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createDoctor',
    inputs: [
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createHospital',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createPharmacist',
    inputs: [{ name: '_address', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'doctorCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'doctorExists',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'doctorIds',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'doctors',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      { name: 'doctorId', type: 'uint256', internalType: 'uint256' },
      { name: 'doctor', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'fetchLastRecordChainIdForFamilyMember',
    inputs: [
      {
        name: '_principalPatientId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_familyMemberId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'fetchLastRecordId',
    inputs: [{ name: '_patientId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hospitalCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hospitalExists',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hospitalIds',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hospitals',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      { name: 'hospitalId', type: 'uint256', internalType: 'uint256' },
      {
        name: 'doctorsCount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'pharmacistsCount',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'admin', type: 'address', internalType: 'address' },
      {
        name: 'approvalStatus',
        type: 'uint8',
        internalType: 'enum AllofHealthV3.approvalType',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isApprovedByPatientToAddNewRecord',
    inputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
      { name: '', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isApprovedByPatientToAddNewRecordForFamilyMember',
    inputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
      { name: '', type: 'uint256', internalType: 'uint256' },
      { name: '', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isDoctor',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isHospitalDoctor',
    inputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
      { name: '', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isHospitalPharmacist',
    inputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
      { name: '', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isPatient',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isPatientApprovedDoctorForFamilyMember',
    inputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
      { name: '', type: 'uint256', internalType: 'uint256' },
      { name: '', type: 'uint256', internalType: 'uint256' },
      { name: '', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isPatientApprovedDoctors',
    inputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
      { name: '', type: 'uint256', internalType: 'uint256' },
      { name: '', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isPatientFamilyMember',
    inputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isPharmacist',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'patientCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'patientIds',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'patients',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      { name: 'patientId', type: 'uint256', internalType: 'uint256' },
      {
        name: 'patientMedicalRecordCount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'patientFamilyMemberCount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'walletAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pharmacistCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pharmacistExists',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pharmacistIds',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pharmacists',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      {
        name: 'pharmacistId',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'pharmacist', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'reassignHospitalAdmin',
    inputs: [
      { name: '_hospitalId', type: 'uint256', internalType: 'uint256' },
      { name: '_admin', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'rejectHospital',
    inputs: [{ name: '_hospitalId', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeDoctorFromHospital',
    inputs: [
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: '_hospitalId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removePharmacistFromHospital',
    inputs: [
      {
        name: '_pharmacistAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: '_hospitalId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeSystemAdmin',
    inputs: [{ name: '_admin', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeAccessToAddNewRecord',
    inputs: [
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: '_patientId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeAccessToAddNewRecordForFamilyMember',
    inputs: [
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: '_patientId', type: 'uint256', internalType: 'uint256' },
      {
        name: '_principalPatientId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeFamilyMemberMedicalRecordAccess',
    inputs: [
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: '_recordId', type: 'uint256', internalType: 'uint256' },
      {
        name: '_principalPatientId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_familyMemberId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeMedicalRecordAccess',
    inputs: [
      { name: '_patientId', type: 'uint256', internalType: 'uint256' },
      { name: '_recordId', type: 'uint256', internalType: 'uint256' },
      {
        name: '_doctorAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'systemAdminCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'systemAdmins',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'viewFamilyMemberMedicalRecord',
    inputs: [
      { name: '_recordId', type: 'uint256', internalType: 'uint256' },
      {
        name: '_principalPatientId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_familyMemberId',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: '_viewer', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '_recordDetails', type: 'string', internalType: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'viewMedicalRecord',
    inputs: [
      { name: '_recordId', type: 'uint256', internalType: 'uint256' },
      { name: '_patientId', type: 'uint256', internalType: 'uint256' },
      { name: '_viewer', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '_recordDetails', type: 'string', internalType: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'viewerHasAccessToMedicalRecord',
    inputs: [
      { name: '_viewer', type: 'address', internalType: 'address' },
      { name: '_patientId', type: 'uint256', internalType: 'uint256' },
      { name: '_recordId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'viewerHasAccessToPatientFamilyMemberMedicalRecord',
    inputs: [
      { name: '_viewer', type: 'address', internalType: 'address' },
      {
        name: '_principalPatientId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_familyMemberId',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: '_recordId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'AdminAdded',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AdminRemoved',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DoctorAdded',
    inputs: [
      {
        name: 'doctor',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'doctorId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DoctorRejected',
    inputs: [
      {
        name: 'doctor',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'doctorId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FamilyMemberMedicalRecordAdded',
    inputs: [
      {
        name: 'doctor',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'principalPatient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'familyMemberId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'medicalRecordId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'HospitalAddedDoctor',
    inputs: [
      {
        name: 'doctor',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'HospitalAddedPharmacist',
    inputs: [
      {
        name: 'pharmacist',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'HospitalApproved',
    inputs: [
      {
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'HospitalCreated',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'HospitalRejected',
    inputs: [
      {
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'HospitalRemovedDoctor',
    inputs: [
      {
        name: 'doctor',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'HospitalRemovedPharmacist',
    inputs: [
      {
        name: 'pharmacist',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MedicalRecordAccessApproved',
    inputs: [
      {
        name: 'patient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'approvedDoctor',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'medicalRecordId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MedicalRecordAccessed',
    inputs: [
      {
        name: 'recordDetailsUri',
        type: 'string',
        indexed: true,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MedicalRecordAdded',
    inputs: [
      {
        name: 'doctor',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'patient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'medicalRecordId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PatientAdded',
    inputs: [
      {
        name: 'patient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'patientId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PatientFamilyMemberAdded',
    inputs: [
      {
        name: 'principalPatientId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'patientId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PharmacistAdded',
    inputs: [
      {
        name: 'pharmacist',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'pharmacistId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RecordAccessRevoked',
    inputs: [
      {
        name: 'patient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'approvedDoctor',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'medicalRecordId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SystemAdminAdded',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'adminId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SystemAdminRemoved',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'adminId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'WriteAccessGranted',
    inputs: [
      {
        name: 'doctor',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'patientId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'WriteAccessRevoked',
    inputs: [
      {
        name: 'doctor',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'patientId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'AccessAlreadyGranted', inputs: [] },
  { type: 'error', name: 'AccessNotGranted', inputs: [] },
  { type: 'error', name: 'AccessToRecordAlreadyGranted', inputs: [] },
  { type: 'error', name: 'AccessToRecordNotGranted', inputs: [] },
  { type: 'error', name: 'DoctorAlreadyRejected', inputs: [] },
  { type: 'error', name: 'DoctorNotApproved', inputs: [] },
  { type: 'error', name: 'DoctorNotFound', inputs: [] },
  { type: 'error', name: 'DuplicateDoctorAddress', inputs: [] },
  { type: 'error', name: 'DuplicateDoctorRegNo', inputs: [] },
  { type: 'error', name: 'DuplicateHospitalRegNo', inputs: [] },
  { type: 'error', name: 'DuplicatePatientAddress', inputs: [] },
  { type: 'error', name: 'DuplicatePatientFamilyMember', inputs: [] },
  { type: 'error', name: 'DuplicatePharmacistAddress', inputs: [] },
  { type: 'error', name: 'HospitalNotApproved', inputs: [] },
  { type: 'error', name: 'InvalidAddress', inputs: [] },
  { type: 'error', name: 'InvalidDoctorId', inputs: [] },
  { type: 'error', name: 'InvalidFamilyMemberId', inputs: [] },
  { type: 'error', name: 'InvalidHospitalId', inputs: [] },
  { type: 'error', name: 'InvalidMedicalRecordDetail', inputs: [] },
  { type: 'error', name: 'InvalidMedicalRecordId', inputs: [] },
  { type: 'error', name: 'InvalidPatientId', inputs: [] },
  { type: 'error', name: 'InvalidPharmacistId', inputs: [] },
  { type: 'error', name: 'InvalidPractitioner', inputs: [] },
  { type: 'error', name: 'InvalidRecordType', inputs: [] },
  { type: 'error', name: 'InvalidRegNo', inputs: [] },
  { type: 'error', name: 'MedicalRecordAccessRevoked', inputs: [] },
  { type: 'error', name: 'MedicalRecordNotFound', inputs: [] },
  { type: 'error', name: 'NotRecordOwner', inputs: [] },
  { type: 'error', name: 'OnlyAdminAllowed', inputs: [] },
  { type: 'error', name: 'OnlyPatientAllowed', inputs: [] },
  { type: 'error', name: 'OnlySystemAdminAllowed', inputs: [] },
  { type: 'error', name: 'PharmacistAlreadyRejected', inputs: [] },
  { type: 'error', name: 'PharmacistNotApproved', inputs: [] },
  { type: 'error', name: 'PharmacistNotFound', inputs: [] },
  { type: 'error', name: 'PractitionerNotApproved', inputs: [] },
  { type: 'error', name: 'RecordNotFound', inputs: [] },
  { type: 'error', name: 'Unauthorized', inputs: [] },
];
export const TOKEN_ABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'DOMAIN_SEPARATOR',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'TOTAL_SUPPLY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'currentSupply',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'eip712Domain',
    inputs: [],
    outputs: [
      {
        name: 'fields',
        type: 'bytes1',
        internalType: 'bytes1',
      },
      {
        name: 'name',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'version',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'chainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'verifyingContract',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'salt',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'extensions',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nonces',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'permit',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'deadline',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'v',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'r',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 's',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      {
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'spender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EIP712DomainChanged',
    inputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'ECDSAInvalidSignature',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ECDSAInvalidSignatureLength',
    inputs: [
      {
        name: 'length',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'ECDSAInvalidSignatureS',
    inputs: [
      {
        name: 's',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InsufficientAllowance',
    inputs: [
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'allowance',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'needed',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InsufficientBalance',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'balance',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'needed',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InvalidApprover',
    inputs: [
      {
        name: 'approver',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InvalidReceiver',
    inputs: [
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InvalidSender',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InvalidSpender',
    inputs: [
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC2612ExpiredSignature',
    inputs: [
      {
        name: 'deadline',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC2612InvalidSigner',
    inputs: [
      {
        name: 'signer',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidAccountNonce',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'currentNonce',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidShortString',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'StringTooLong',
    inputs: [
      {
        name: 'str',
        type: 'string',
        internalType: 'string',
      },
    ],
  },
];

export const rpcUrls: string[] = [
  process.env.LISK_TENDERLY_RPC_URL || '',
  process.env.LISK_GELATO_RPC_URL || '',
  process.env.LISK_DRPC_RPC_URL || '',
];
export const rpcUrlsTestnet: string[] = [
  process.env.LISK_TENDERLY_SEPOLIA_RPC_URL || '',
  process.env.LISK_GELATO_SEPOLIA_RPC_URL || '',
  process.env.LISK_DRPC_SEPOLIA_RPC_URL || '',
];
