import { TWeek } from '@/shared/modules/cal.com/interface/cal.com.interface';

interface IAvailabilityConfig {
  weekDay: TWeek;
  startTime: string;
  endTime: string;
}

export interface ICreateAvailability {
  doctorId: string;
  availabilityConfig: IAvailabilityConfig[];
}
