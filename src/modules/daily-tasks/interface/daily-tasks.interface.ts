export type TActionTypes =
  | 'ADD_HEALTH_JOURNAL'
  | 'ACCEPT_APPROVAL'
  | 'CREATE_MEDICAL_RECORD'
  | 'COMPLETE_HEALTH_INFO'
  | 'UPDATE_PROFILE';

export interface TaskType {
  id: string;
  name: string;
  description: string;
  actionType: string;
  applicableRoles: string[];
  tokenReward: number;
}

export interface DailyTask {
  id: string;
  userId: string;
  taskTypeId: string;
  taskDate: string;
  isCompleted: boolean;
  completedAt?: Date;
  tokenReward: number;
  taskType: TaskType;
}

export interface TaskCompletionData {
  actionType: string;
  relatedEntityId: string;
  relatedEntityType: string;
}

export interface IGenerateDailyTasks {
  userId: string;
}

export interface IGetUserDailyTasks {
  userId: string;
  date?: string;
}

export interface ICompleteTask {
  userId: string;
  actionType: string;
  relatedEntityId: string;
  relatedEntityType: string;
}

export interface IGetTaskStats {
  userId: string;
  startDate?: string;
  endDate?: string;
}

export interface IHandleApprovalAcceptance {
  doctorUserId: string;
  approvalId: string;
}

export interface IHandleMedicalRecordCreation {
  doctorUserId: string;
  recordId: string;
}

export interface IHandleHealthInfoCompletion {
  userId: string;
  healthInfoId: string;
}

export interface IHandleHealthJournalCompletion {
  userId: string;
  journalId: string;
}
