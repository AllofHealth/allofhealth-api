export type TMood = 'great' | 'good' | 'neutral' | 'low';

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
