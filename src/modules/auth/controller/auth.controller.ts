import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { SuccessResponseDto } from '@/shared/dtos/shared.dto';
import { Body, Controller, HttpStatus, Ip, Post } from '@nestjs/common';
import {
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthErrorMessage as AEM,
  AuthSuccessMessage as ASM,
} from '../data/auth.data';
import { AuthService } from '../service/auth.service';
import { SignInDto, SignUpDto } from '../dto/auth.dto';
import { AuthError } from '../error/auth.error';

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
    example: {
      description: AEM.USER_ALREADY_EXISTS,
      status: HttpStatus.FOUND,
      message: AEM.USER_ALREADY_EXISTS,
    },
  })
  async signUp(@Ip() ip: string, @Body() ctx: SignUpDto) {
    this.logger.log(`Sign up request from ${ip}`);
    return await this.authService.handleRegister(ctx);
  }

  @Post('signIn')
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiNotFoundResponse({
    description: AEM.USER_NOT_FOUND,
    example: {
      status: HttpStatus.NOT_FOUND,
      message: AEM.USER_NOT_FOUND,
    },
  })
  @ApiUnauthorizedResponse({
    type: AuthError,
    example: {
      status: HttpStatus.UNAUTHORIZED,
      message: AEM.INVALID_CREDENTIALS,
    },
  })
  @ApiOkResponse({
    description: ASM.LOGGED_IN,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.LOGGED_IN,
      data: {
        userId: '',
        fullName: '',
        email: '',
        role: 'PATIENT',
        profilePicture: '',
        isFirstTime: true,
        refreshToken: '',
        accessToken: '',
      },
    },
  })
  async signIn(@Ip() ip: string, @Body() ctx: SignInDto) {
    this.logger.log(`Sign in request from ${ip}`);
    return await this.authService.handleLogin(ctx);
  }
}
