export interface ICreateConsultationType {
  doctorId: string;
  description?: string;
  durationMinutes?: number;
  price: number;
  currency?: string;
  consultationTypeId: string;
}

export interface IGetDoctorConsultationTypes {
  doctorId: string;
  activeOnly?: boolean;
}

export interface IUpdateConsultationType {
  id: string;
  data: Partial<{
    description: string;
    durationMinutes: number;
    price: number;
    isActive: boolean;
    eventTypeId: number
  }>;
}
