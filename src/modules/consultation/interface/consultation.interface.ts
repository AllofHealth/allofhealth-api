export interface ICreateConsultationType {
  doctorId: string;
  name: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  price: number;
  currency: string;
  calcomEventTypeId?: number;
}

export interface IGetDoctorConsultationTypes {
  doctorId: string;
  activeOnly?: boolean;
}

export interface IUpdateConsultationType {
  id: string;
  data: Partial<{
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
    isActive: boolean;
  }>;
}
