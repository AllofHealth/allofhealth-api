/**
 * Booking Domain Events
 * These events are emitted during the booking lifecycle
 */

export class BookingCreatedEvent {
    constructor(
        public readonly bookingId: string,
        public readonly patientId: string,
        public readonly doctorId: string,
        public readonly amount: number,
    ) { }
}

export class BookingConfirmedEvent {
    constructor(
        public readonly bookingId: string,
        public readonly patientId: string,
        public readonly doctorId: string,
        public readonly videoRoomUrl: string,
    ) { }
}

export class BookingCancelledEvent {
    constructor(
        public readonly bookingId: string,
        public readonly patientId: string,
        public readonly doctorId: string,
        public readonly paymentStatus: string,
        public readonly amount: number,
    ) { }
}

export class BookingCompletedEvent {
    constructor(
        public readonly bookingId: string,
        public readonly patientId: string,
        public readonly doctorId: string,
        public readonly duration: number,
    ) { }
}

