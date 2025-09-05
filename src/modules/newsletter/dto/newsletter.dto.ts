import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SubscribeDto {
  @ApiProperty({
    description: 'Email address of the subscriber',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  emailAddress: string;
}
