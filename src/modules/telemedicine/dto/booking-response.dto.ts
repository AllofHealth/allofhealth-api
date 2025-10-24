import { ApiProperty } from '@nestjs/swagger';

export class BookingResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    bookingReference: string;

    @ApiProperty()
    patientId: string;

    @ApiProperty()
    doctorId: string;

    @ApiProperty()
    consultationTypeId: string;

    @ApiProperty()
    startTime: Date;

    @ApiProperty()
    endTime: Date;

    @ApiProperty()
    status: string;

    @ApiProperty()
    paymentStatus: string;

    @ApiProperty()
    amount: string;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    videoRoomUrl: string;

    @ApiProperty()
    createdAt: Date;
}