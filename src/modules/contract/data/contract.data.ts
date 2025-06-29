export enum ContractErrorMessages {
  ERROR_PROVIDING_CONTRACT = 'Error providing contract',
}

export const abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], type: 'error', name: 'AccessAlreadyGranted' },
  { inputs: [], type: 'error', name: 'AccessNotGranted' },
  {
    inputs: [],
    type: 'error',
    name: 'AccessToRecordAlreadyGranted',
  },
  { inputs: [], type: 'error', name: 'AccessToRecordNotGranted' },
  { inputs: [], type: 'error', name: 'DoctorAlreadyRejected' },
  { inputs: [], type: 'error', name: 'DoctorNotApproved' },
  { inputs: [], type: 'error', name: 'DoctorNotFound' },
  { inputs: [], type: 'error', name: 'DuplicateDoctorAddress' },
  { inputs: [], type: 'error', name: 'DuplicateDoctorRegNo' },
  { inputs: [], type: 'error', name: 'DuplicateHospitalRegNo' },
  { inputs: [], type: 'error', name: 'DuplicatePatientAddress' },
  {
    inputs: [],
    type: 'error',
    name: 'DuplicatePatientFamilyMember',
  },
  { inputs: [], type: 'error', name: 'DuplicatePharmacistAddress' },
  { inputs: [], type: 'error', name: 'HospitalNotApproved' },
  { inputs: [], type: 'error', name: 'InvalidAddress' },
  { inputs: [], type: 'error', name: 'InvalidDoctorId' },
  { inputs: [], type: 'error', name: 'InvalidFamilyMemberId' },
  { inputs: [], type: 'error', name: 'InvalidHospitalId' },
  { inputs: [], type: 'error', name: 'InvalidMedicalRecordDetail' },
  { inputs: [], type: 'error', name: 'InvalidMedicalRecordId' },
  { inputs: [], type: 'error', name: 'InvalidPatientId' },
  { inputs: [], type: 'error', name: 'InvalidPharmacistId' },
  { inputs: [], type: 'error', name: 'InvalidPractitioner' },
  { inputs: [], type: 'error', name: 'InvalidRecordType' },
  { inputs: [], type: 'error', name: 'InvalidRegNo' },
  { inputs: [], type: 'error', name: 'MedicalRecordAccessRevoked' },
  { inputs: [], type: 'error', name: 'MedicalRecordNotFound' },
  { inputs: [], type: 'error', name: 'NotRecordOwner' },
  { inputs: [], type: 'error', name: 'OnlyAdminAllowed' },
  { inputs: [], type: 'error', name: 'OnlyPatientAllowed' },
  { inputs: [], type: 'error', name: 'OnlySystemAdminAllowed' },
  { inputs: [], type: 'error', name: 'PharmacistAlreadyRejected' },
  { inputs: [], type: 'error', name: 'PharmacistNotApproved' },
  { inputs: [], type: 'error', name: 'PharmacistNotFound' },
  { inputs: [], type: 'error', name: 'PractitionerNotApproved' },
  { inputs: [], type: 'error', name: 'RecordNotFound' },
  { inputs: [], type: 'error', name: 'Unauthorized' },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'admin',
        type: 'address',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'AdminAdded',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'admin',
        type: 'address',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'AdminRemoved',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'doctor',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'doctorId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'DoctorAdded',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'doctor',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'doctorId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'DoctorRejected',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'doctor',
        type: 'address',
        indexed: false,
      },
      {
        internalType: 'address',
        name: 'principalPatient',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'familyMemberId',
        type: 'uint256',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'medicalRecordId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'FamilyMemberMedicalRecordAdded',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'doctor',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'HospitalAddedDoctor',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'pharmacist',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'HospitalAddedPharmacist',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'HospitalApproved',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'admin',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'HospitalCreated',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'HospitalRejected',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'doctor',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'HospitalRemovedDoctor',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'pharmacist',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'hospitalId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'HospitalRemovedPharmacist',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'patient',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'approvedDoctor',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'medicalRecordId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'MedicalRecordAccessApproved',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'recordDetailsUri',
        type: 'string',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'MedicalRecordAccessed',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'doctor',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'patient',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'medicalRecordId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'MedicalRecordAdded',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'patient',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'patientId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'PatientAdded',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'principalPatientId',
        type: 'uint256',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'patientId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'PatientFamilyMemberAdded',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'pharmacist',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'pharmacistId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'PharmacistAdded',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'patient',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'approvedDoctor',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'medicalRecordId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'RecordAccessRevoked',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'admin',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'adminId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'SystemAdminAdded',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'admin',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'adminId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'SystemAdminRemoved',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'doctor',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'patientId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'WriteAccessGranted',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'doctor',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'patientId',
        type: 'uint256',
        indexed: true,
      },
    ],
    type: 'event',
    name: 'WriteAccessRevoked',
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_hospitalId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'addDoctorToHospital',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_patientAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_patientId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_recordDetailsUri',
        type: 'string',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'addMedicalRecord',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_principalPatientId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_familyMemberId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_recordDetailsUri',
        type: 'string',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'addMedicalRecordForFamilyMember',
  },
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'addPatient',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_principalPatientId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'addPatientFamilyMember',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_pharmacistAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_hospitalId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'addPharmacistToHospital',
  },
  {
    inputs: [{ internalType: 'address', name: '_admin', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'addSystemAdmin',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_patientId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'approveAccessToAddNewRecord',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_patientId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_principalPatientId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'approveAccessToAddNewRecordForFamilyMember',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_principalPatientId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_familyMemberId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_recordId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'approveFamilyMemberMedicalRecordAccess',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_hospitalId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'approveHospital',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_practitionerAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_patientId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_recordId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'approveMedicalRecordAccess',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'createDoctor',
  },
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'createHospital',
  },
  {
    inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'createPharmacist',
  },
  {
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    name: 'doctorCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    name: 'doctorExists',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    name: 'doctors',
    outputs: [
      {
        internalType: 'uint256',
        name: 'doctorId',
        type: 'uint256',
      },
      { internalType: 'address', name: 'doctor', type: 'address' },
    ],
  },
  {
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    name: 'hospitalCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    name: 'hospitalExists',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    name: 'hospitals',
    outputs: [
      {
        internalType: 'uint256',
        name: 'hospitalId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'doctorsCount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'pharmacistsCount',
        type: 'uint256',
      },
      { internalType: 'address', name: 'admin', type: 'address' },
      {
        internalType: 'enum AllofHealthV3.approvalType',
        name: 'approvalStatus',
        type: 'uint8',
      },
    ],
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'isApprovedByPatientToAddNewRecord',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'isApprovedByPatientToAddNewRecordForFamilyMember',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
    name: 'isDoctor',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'isHospitalDoctor',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'isHospitalPharmacist',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
    name: 'isPatient',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'isPatientApprovedDoctorForFamilyMember',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'isPatientApprovedDoctors',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'isPatientFamilyMember',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
    name: 'isPharmacist',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    name: 'patientCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    name: 'patients',
    outputs: [
      {
        internalType: 'uint256',
        name: 'patientId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'patientMedicalRecordCount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'patientFamilyMemberCount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'walletAddress',
        type: 'address',
      },
    ],
  },
  {
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    name: 'pharmacistCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    name: 'pharmacistExists',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    name: 'pharmacists',
    outputs: [
      {
        internalType: 'uint256',
        name: 'pharmacistId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'pharmacist',
        type: 'address',
      },
    ],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_hospitalId',
        type: 'uint256',
      },
      { internalType: 'address', name: '_admin', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'reassignHospitalAdmin',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_hospitalId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'rejectHospital',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_hospitalId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'removeDoctorFromHospital',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_pharmacistAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_hospitalId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'removePharmacistFromHospital',
  },
  {
    inputs: [{ internalType: 'address', name: '_admin', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'removeSystemAdmin',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_patientId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'revokeAccessToAddNewRecord',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_patientId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_principalPatientId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'revokeAccessToAddNewRecordForFamilyMember',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_recordId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_principalPatientId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_familyMemberId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'revokeFamilyMemberMedicalRecordAccess',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_patientId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_recordId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_doctorAddress',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'revokeMedicalRecordAccess',
  },
  {
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    name: 'systemAdminCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
    name: 'systemAdmins',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_recordId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_principalPatientId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_familyMemberId',
        type: 'uint256',
      },
      { internalType: 'address', name: '_viewer', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'viewFamilyMemberMedicalRecord',
    outputs: [
      {
        internalType: 'string',
        name: '_recordDetails',
        type: 'string',
      },
    ],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_recordId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_patientId',
        type: 'uint256',
      },
      { internalType: 'address', name: '_viewer', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'viewMedicalRecord',
    outputs: [
      {
        internalType: 'string',
        name: '_recordDetails',
        type: 'string',
      },
    ],
  },
  {
    inputs: [
      { internalType: 'address', name: '_viewer', type: 'address' },
      {
        internalType: 'uint256',
        name: '_patientId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_recordId',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'viewerHasAccessToMedicalRecord',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  {
    inputs: [
      { internalType: 'address', name: '_viewer', type: 'address' },
      {
        internalType: 'uint256',
        name: '_principalPatientId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_familyMemberId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_recordId',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'viewerHasAccessToPatientFamilyMemberMedicalRecord',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  },
  { inputs: [], stateMutability: 'payable', type: 'receive' },
];
