export enum HealthJournalErrorMessages {
  ERROR_ADDING_ENTRY = 'Error adding entry',
  ERROR_FETCHING_JOURNAL = 'Error fetching journal',
  ERROR_FETCHING_MONTHLY_JOURNAL = 'Error fetching monthly journal',
  ERROR_CALCULATING_MONTHLY_AVERAGE_MOOD_SCORE = 'Error calculating monthly average mood score',
}

export enum HealthJournalSuccessMessages {
  SUCCESS_ADDING_ENTRY = 'Entry added successfully',
  SUCCESS_FETCHING_JOURNAL = 'Journal fetched successfully',
  SUCCESS_FETCHING_MONTHLY_JOURNAL = 'Monthly journal fetched successfully',
}

export enum MOOD_INDEX {
  BAD = 0,
  LOW = 1,
  NEUTRAL = 2,
  GOOD = 3,
  GREAT = 4,
}
