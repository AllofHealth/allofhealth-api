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
  userId?: string;
  id?: string;
  data: Partial<{
    description: string;
    durationMinutes: number;
    price: number;
    isActive: boolean;
    eventTypeId: number;
  }>;
}

export type TConsultationTypes =
  | 'General Consultation'
  | 'Follow-up Consultation'
  | 'Specialist Consultation'
  | 'Emergency Consultation'
  | 'Online Consultation'
  | 'In-person Consultation'
  | 'Pediatric Consultation'
  | 'Geriatric Consultation'
  | 'Dermatology Consultation'
  | 'Cardiology Consultation'
  | 'Neurology Consultation'
  | 'Psychiatry Consultation'
  | 'Nutrition Consultation'
  | 'Physiotherapy Consultation'
  | 'Dental Consultation';

export interface IConsultation {
  consultationId: string | null;
  consultationOffered: string | null;
  description: string | null;
  price: string | null;
}

export interface IFindDoctorConsultation {
  doctorId?: string;
  consultationId?: string;
}
