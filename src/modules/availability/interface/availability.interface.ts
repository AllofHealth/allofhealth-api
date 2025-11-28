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

export interface IUpdateAvailabilityConfig {
  id: string;
  startTime?: string;
  endTime?: string;
}

export interface IUpdateAvailability {
  doctorId: string;
  availabilityConfig: IUpdateAvailabilityConfig[];
}

export interface IDeleteAvailability {
  doctorId: string;
  id: string[];
}
