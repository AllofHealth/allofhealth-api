import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitializePaymentDto {
    @ApiProperty({ description: 'Cal.com booking UID' })
    @IsString()
    @IsNotEmpty()
    calcomBookingId: string;
}
