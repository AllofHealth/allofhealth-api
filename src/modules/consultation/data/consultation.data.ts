export enum CONSULTATION_ERROR_MESSAGES {
  ERROR_CREATING_CONSULTATION_TYPE = 'Error creating consultation type',
  ERROR_GETTING_CONSULTATION_TYPES = 'Error getting consultation types',
  ERROR_UPDATING_CONSULTATION_TYPE = 'Error updating consultation type',
  ERROR_FINDING_CALCOM_EVENT_TYPE = 'Error finding Calcom event type',
  ERROR_FINDING_CONSULTATION_TYPE = 'Error finding consultation type',
  ERROR_DELETING_CONSULTATION_TYPE = 'Error deleting consultation type',
  ERROR_ADDING_CONSULTATION_TYPE = 'Error adding consultation type',
  ERROR_FETCHING_ALL_CONSULTATION_TYPES = 'Error fetching all consultation types',
}

export enum CONSULTATION_SUCCESS_MESSAGES {
  SUCCESS_CREATING_CONSULTATION_TYPE = 'Consultation type created successfully',
  SUCCESS_GETTING_CONSULTATION_TYPES = 'Consultation types retrieved successfully',
  SUCCESS_UPDATING_CONSULTATION_TYPE = 'Consultation type updated successfully',
  SUCCESS_DELETING_CONSULTATION_TYPE = 'Consultation type deleted successfully',
  SUCCESS_FINDING_CALCOM_EVENT_TYPE = 'Calcom event type found successfully',
  SUCCESS_FINDING_CONSULTATION_TYPE = 'Consultation type found successfully',
  SUCCESS_ADDING_CONSULTATION_TYPE = 'Consultation type added successfully',
  SUCCESS_FETCHING_CONSULTATION_TYPES = 'Consultation types fetched successfully',
}

export const CONSULTATION_TYPES_SEED_DATA = [
  { name: 'General Consultation' },
  { name: 'Follow-up Consultation' },
  { name: 'Specialist Consultation' },
  { name: 'Emergency Consultation' },
  { name: 'Online Consultation' },
  { name: 'In-person Consultation' },
  { name: 'Pediatric Consultation' },
  { name: 'Geriatric Consultation' },
  { name: 'Dermatology Consultation' },
  { name: 'Cardiology Consultation' },
  { name: 'Neurology Consultation' },
  { name: 'Psychiatry Consultation' },
  { name: 'Nutrition Consultation' },
  { name: 'Physiotherapy Consultation' },
  { name: 'Dental Consultation' },
];
