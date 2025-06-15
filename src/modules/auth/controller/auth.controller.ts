import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { SuccessResponseDto } from '@/shared/dtos/shared.dto';
import { Body, Controller, HttpStatus, Ip, Post } from '@nestjs/common';
import {
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthErrorMessage as AEM,
  AuthSuccessMessage as ASM,
} from '../data/auth.data';
import { AuthService } from '../service/auth.service';
import { SignUpDto } from '../dto/auth.dto';

@ApiTags('Auth Operations')
@Controller('auth')
export class AuthController {
  private readonly logger = new MyLoggerService(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiOkResponse({
    description: ASM.REGISTRATION_SUCCESS,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.REGISTRATION_SUCCESS,
      data: {
        userId: '',
        fullName: '',
        email: '',
        profilePicture: '',
        gender: '',
        role: '',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.REGISTRATION_FAILED,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.REGISTRATION_FAILED,
    },
  })
  @ApiFoundResponse({
    description: AEM.USER_ALREADY_EXISTS,
    example: {
      status: HttpStatus.FOUND,
      message: AEM.USER_ALREADY_EXISTS,
    },
  })
  async signUp(@Ip() ip: string, @Body() ctx: SignUpDto) {
    this.logger.log(`Sign up request from ${ip}`);
    return await this.authService.handleRegister(ctx);
  }
}
