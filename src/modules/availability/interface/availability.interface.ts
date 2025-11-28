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

export interface IFetchWeekDayAvailability {
  doctorId: string;
  weekDay: WeekDay;
}
