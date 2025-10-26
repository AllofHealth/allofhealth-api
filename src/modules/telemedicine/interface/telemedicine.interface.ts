export interface ISendConfirmationEmail {
  bookingId: string;
  patientId: string;
  doctorId: string;
  videoRoomUrl: string;
  startTime: Date;
  endTime: Date;
  type: string;
}

export interface ISendCancelationEmail {
  bookingId: string;
  patientId: string;
  doctorId: string;
  refundAmount?: number;
  type: string;
}

export interface ISendSurveyEmail {
  bookingId: string;
  patientId: string;
  doctorId: string;
}

export interface ISendRequestReview extends ISendSurveyEmail {}

export interface ISendTelemedicineReminder {
  bookingId: string;
  patientId: string;
  doctorId: string;
  reminderType: '24h';
  videoRoomUrl: string;
}
