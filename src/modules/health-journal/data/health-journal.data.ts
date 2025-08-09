export enum HealthJournalErrorMessages {
  ERROR_ADDING_ENTRY = 'Error adding entry',
  ERROR_FETCHING_JOURNAL = 'Error fetching journal',
  ERROR_FETCHING_MONTHLY_JOURNAL = 'Error fetching monthly journal',
  ERROR_CALCULATING_MONTHLY_AVERAGE_MOOD_SCORE = 'Error calculating monthly average mood score',
  ERROR_FETCHING_HEALTH_JOURNAL_METRICS = 'Error fetching health journal metrics',
  ERROR_CREATING_HEALTH_JOURNAL_METRICS = 'Error creating health journal metrics',
  ERROR_UPDATING_HEALTH_JOURNAL_METRICS = 'Error updating health journal metrics',
}

export enum HealthJournalSuccessMessages {
  SUCCESS_ADDING_ENTRY = 'Entry added successfully',
  SUCCESS_FETCHING_JOURNAL = 'Journal fetched successfully',
  SUCCESS_FETCHING_MONTHLY_JOURNAL = 'Monthly journal fetched successfully',
  SUCCESS_CREATING_HEALTH_JOURNAL_METRICS = 'Health journal metrics created successfully',
  SUCCESS_UPDATING_HEALTH_JOURNAL_METRICS = 'Health journal metrics updated successfully',
  SUCCESS_FETCHING_JOURNAL_METRICS = 'Journal metrics fetched successfully',
}

export enum MOOD_INDEX {
  BAD = 0,
  LOW = 1,
  NEUTRAL = 2,
  GOOD = 3,
  GREAT = 4,
}
