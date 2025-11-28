import { TWeek } from '@/shared/modules/cal.com/interface/cal.com.interface';
import { WeekDay } from '../dto/availability.dto';

interface IAvailabilityConfig {
  weekDay: WeekDay;
  startTime: string;
  endTime: string;
}

export interface ICreateAvailability {
  doctorId: string;
  availabilityConfig: IAvailabilityConfig[];
}
