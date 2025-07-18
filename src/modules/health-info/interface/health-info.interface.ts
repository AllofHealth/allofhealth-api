export type TPainLevel = 'severe' | 'moderate' | 'mild';

export interface ICreateHealthInfo {
  userId: string;
  howAreYouFeeling: string;
  whenDidItStart: string;
  painLevel: TPainLevel;
  knownConditions?: string[];
  medicationsTaken?: string[];
  attachmentFilePath?: string;
}

export interface IHandleAttachmentUpload {
  userId: string;
  attachmentFilePath: string;
}
