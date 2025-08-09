export type TMood = 'great' | 'good' | 'neutral' | 'low' | 'bad';
export type TDuration = 'monthly' | 'yearly';

export interface IAddEntry {
  userId: string;
  mood: TMood;
  symptoms?: string[];
  activities?: string[];
  tags?: string[];
}

export interface IFetchJournal {
  userId: string;
  page?: number;
  limit?: number;
}

export interface ICreateMetrics {
  userId: string;
  year?: number;
}

export interface IFetchMonthlyJournal {
  userId: string;
  month: number;
}

export interface ICalculateMoodScore {
  userId: string;
  month: number;
}

export interface IUpdateMonthlyMood {
  userId: string;
  month?: number;
}

export interface IFetchJournalMetrics {
  userId: string;
  year?: number;
  duration: TDuration;
}
