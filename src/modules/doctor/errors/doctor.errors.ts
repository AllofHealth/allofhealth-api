import { DOCTOR_ERROR_MESSGAES } from '../data/doctor.data';

export class DoctorError extends Error {
  constructor(message: string = DOCTOR_ERROR_MESSGAES.ERROR_CREATING_DOCTOR) {
    super(message);
    this.name = 'DoctorErrors';
  }
}
