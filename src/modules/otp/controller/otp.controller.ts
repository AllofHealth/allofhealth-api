import { Body, Controller, Get, Ip, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OtpService } from '../service/otp.service';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { VerifyOtpDto } from '../dto/otp.dto';

@ApiTags('Otp Operations')
@Controller('otp')
export class OtpController {
  private readonly logger = new MyLoggerService(OtpController.name);
  constructor(private readonly otpService: OtpService) {}

  @Get('generateOtp')
  @ApiOperation({ summary: 'Generate OTP' })
  @ApiOkResponse({
    description: 'OTP generated successfully',
    type: String,
    example: '123456',
  })
  generateOtp(@Ip() ip: string) {
    this.logger.log(`Generating OTP for IP: ${ip}`);
    return this.otpService.generateOtp();
  }

  @Post('verifyOtp')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiOkResponse({
    description: 'OTP verified successfully',
    type: Boolean,
    example: true,
  })
  verifyOtp(@Ip() ip: string, @Body() ctx: VerifyOtpDto) {
    this.logger.log(`Verifying OTP for IP: ${ip}`);
    return this.otpService.validateOtp(ctx.token);
  }
}
