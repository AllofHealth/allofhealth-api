export enum BOOKING_ERROR_MESSAGES {
  ERROR_CREATE_BOOKING = 'Error creating booking',
  BOOKING_NOT_FOUND = 'Booking not found',
  ERROR_FINDING_BOOKING = 'Error finding booking',
  ERROR_UPDATING_BOOKING_STATUS = 'Error updating booking status',
  ERROR_UPDATING_VIDEO_ROOM = 'Error updating video room',
  ERROR_UPDATING_PAYMENT_DETAILS = 'Error updating payment details',
  ERROR_CANCELING_BOOKING = 'Error canceling booking',
  ERROR_GETTING_PATIENT_BOOKINGS = 'Error getting patient bookings',
  ERROR_GETTING_BOOKING = 'Error getting booking',
  ERROR_GETTING_DOCTOR_BOOKINGS = 'Error getting doctor bookings',
  ERROR_FETCHING_ALL_BOOKINGS = 'Error fetching all bookings',
}
export enum BOOKING_SUCCESS_MESSAGES {
  SUCCESS_CREATE_BOOKING = 'Booking created successfully',
  SUCCESS_FIND_BOOKING = 'Booking found successfully',
  SUCCESS_UPDATE_BOOKING_STATUS = 'Booking status updated successfully',
  SUCCESS_UPDATING_VIDEO_ROOM = 'Video room updated successfully',
  SUCCESS_UPDATING_PAYMENT_DETAILS = 'Payment details updated successfully',
  SUCCESS_CANCELING_BOOKING = 'Booking canceled successfully',
  SUCCESS_GETTING_PATIENT_BOOKINGS = 'Patient bookings retrieved successfully',
  SUCCESS_GETTING_BOOKING = 'Booking retrieved successfully',
  SUCCESS_GETTING_DOCTOR_BOOKINGS = 'Doctor bookings retrieved successfully',
  SUCCESS_FETCHING_ALL_BOOKINGS = 'All bookings retrieved successfully',
}

export const BOOKING_DURATION = 45;
