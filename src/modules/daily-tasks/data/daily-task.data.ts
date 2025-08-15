export enum TASK_ACTIONS {
  ADD_HEALTH_JOURNAL = 'ADD_HEALTH_JOURNAL',
  ACCEPT_APPROVAL = 'ACCEPT_APPROVAL',
  CREATE_MEDICAL_RECORD = 'CREATE_MEDICAL_RECORD',
  COMPLETE_HEALTH_INFO = 'COMPLETE_HEALTH_INFO',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
}

export const DEFAULT_TASK_TYPES = [
  {
    name: 'Log Health Journal Entry',
    description:
      'Add an entry to your health journal to track your daily wellness',
    actionType: 'ADD_HEALTH_JOURNAL',
    applicableRoles: ['PATIENT'],
    tokenReward: '0.01',
  },
  {
    name: 'Accept Patient Approval',
    description:
      "Review and accept a patient's health information access request",
    actionType: 'ACCEPT_APPROVAL',
    applicableRoles: ['DOCTOR'],
    tokenReward: '0.01',
  },
  {
    name: 'Create Medical Record',
    description: 'Create a new medical record for a patient consultation',
    actionType: 'CREATE_MEDICAL_RECORD',
    applicableRoles: ['DOCTOR'],
    tokenReward: '0.01',
  },
  {
    name: 'Complete Health Assessment',
    description:
      'Fill out your health information to help doctors provide better care',
    actionType: 'COMPLETE_HEALTH_INFO',
    applicableRoles: ['PATIENT'],
    tokenReward: '0.01',
  },
  {
    name: 'Update Profile Information',
    description: 'Keep your profile information up to date',
    actionType: 'UPDATE_PROFILE',
    applicableRoles: ['PATIENT', 'DOCTOR'],
    tokenReward: '0.01',
  },
];
