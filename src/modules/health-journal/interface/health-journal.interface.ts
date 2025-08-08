export type TMood = 'great' | 'good' | 'neutral' | 'low' | 'bad';

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

export interface IFetchMonthlyJournal {
  userId: string;
  month: number;
}
