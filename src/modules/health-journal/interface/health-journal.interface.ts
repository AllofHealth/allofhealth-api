export type TMood = 'GREAT' | 'GOOD' | 'NEUTRAL' | 'LOW';

export interface IAddEntry {
  userId: string;
  mood: TMood;
  symptoms?: string[];
  activities?: string[];
  tags?: string[];
}
