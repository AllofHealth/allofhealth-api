import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'transaction id',
    example: 'tx-123456',
  })
  txId: string;

  @ApiPropertyOptional({
    description: 'payment provider',
    example: 'paypal',
  })
  provider?: string;
}
