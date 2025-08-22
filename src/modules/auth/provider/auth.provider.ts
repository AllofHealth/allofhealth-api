import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '@/modules/token/service/token.service';
import { ICreateUser } from '@/modules/user/interface/user.interface';
import { UserService } from '@/modules/user/service/user.service';
import { EOnUserLogin } from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import { AuthUtils } from '@/shared/utils/auth.utils';
import {
  AuthErrorMessage as AEM,
  AuthSuccessMessage as ASM,
} from '../data/auth.data';
import { AuthError } from '../error/auth.error';
import {
  IGenerateTokens,
  IJwtPayload,
  ILogin,
} from '../interface/auth.interface';

@Injectable()
export class AuthProvider {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly authUtils: AuthUtils,
    private readonly eventEmitter: EventEmitter2,
    private readonly handler: ErrorHandler,
  ) {}

  async generateTokens(payload: IGenerateTokens) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30m',
    });

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, tokenType: 'refresh' },
      { expiresIn: '7d' },
    );

    const expiresIn = 7 * 24 * 60 * 60;
    const result = await this.tokenService.saveRefreshToken({
      userId: payload.userId,
      token: refreshToken,
      expiresIn,
    });

    if (result.status !== HttpStatus.OK) {
      return {
        status: result.status,
        message: result.message,
      };
    }

    return { accessToken, refreshToken };
  }

  private async findUserById(userId: string) {
    return await this.userService.findUser(userId);
  }

  private async findUserByEmail(emailAddress: string) {
    return await this.userService.findUserByEmail(emailAddress);
  }

  async createUser(ctx: ICreateUser) {
    return await this.userService.createUser(ctx);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<
        IJwtPayload & { tokenType?: string }
      >(refreshToken);

      if (payload.tokenType !== 'refresh') {
        return {
          status: HttpStatus.UNAUTHORIZED,
          message: AEM.INVALID_TOKEN_TYPE,
        };
      }

      const tokenResult = await this.tokenService.findToken({
        userId: payload.userId,
        token: refreshToken,
      });

      if (
        tokenResult.status !== HttpStatus.OK ||
        !('data' in tokenResult && tokenResult.data)
      ) {
        return {
          status: HttpStatus.UNAUTHORIZED,
          message: AEM.TOKEN_NOT_FOUND,
        };
      }

      const userResult = await this.findUserById(payload.userId);
      if (
        userResult.status !== HttpStatus.OK ||
        !('data' in userResult) ||
        userResult.data === null
      ) {
        return {
          status: HttpStatus.OK,
          message: userResult.message,
        };
      }

      const tokens = await this.generateTokens({
        userId: payload.userId,
        email: payload.email,
      });

      if (!(tokens.accessToken && tokens.refreshToken)) {
        throw new AuthError('Tokens are missing', HttpStatus.NOT_FOUND);
      }

      await this.tokenService.revokeToken({
        userId: tokenResult.data.userId,
        replacementToken: tokens.refreshToken,
      });

      return {
        status: HttpStatus.OK,
        message: ASM.TOKEN_REFRESH_SUCCESS,
        data: {
          refreshToken: tokens.refreshToken,
          accessToken: tokens.accessToken,
          user: {
            userId: userResult.data.userId,
            email: userResult.data.email,
            role: userResult.data.role,
            fullName: userResult.data.fullName,
            profilePicture: userResult.data.profilePicture,
            gender: userResult.data.gender,
          },
        },
      };
    } catch (error) {
      return this.handler.handleError(error, AEM.TOKEN_REFRESH_FAILED);
    }
  }

  async handleSignup(ctx: ICreateUser) {
    try {
      const result = await this.createUser({
        ...ctx,
        authProvider: 'CREDENTIALS',
      });
      if (result.status !== HttpStatus.OK) {
        return {
          status: result.status,
          message: result.message,
        };
      }

      return {
        status: HttpStatus.OK,
        message: ASM.REGISTRATION_SUCCESS,
      };
    } catch (error) {
      return this.handler.handleError(error, AEM.REGISTRATION_FAILED);
    }
  }

  async handleLogin(ctx: ILogin) {
    const { email, password } = ctx;
    try {
      const result = await this.findUserByEmail(email);
      if (
        result.status !== HttpStatus.OK ||
        !('data' in result && result.data)
      ) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: AEM.USER_NOT_FOUND,
        };
      }

      const userProfile = result.data;
      await this.userService.checkUserSuspension(userProfile.userId);

      const isPasswordValid = await this.authUtils.compare({
        hashedPassword: userProfile.password,
        password,
      });

      if (!isPasswordValid) {
        throw new UnauthorizedException(
          new AuthError(AEM.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED),
        );
      }

      const tokens = await this.generateTokens({
        userId: userProfile.userId,
        email: userProfile.email,
      });

      this.eventEmitter.emit(
        SharedEvents.UPDATE_USER_LOGIN,
        new EOnUserLogin(
          userProfile.userId,
          new Date(),
          new Date(),
          'CREDENTIALS',
        ),
      );

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.LOGGED_IN,
        data: {
          userId: userProfile.userId,
          fullName: userProfile.fullName,
          email: userProfile.email,
          role: userProfile.role,
          profilePicture: userProfile.profilePicture,
          isFirstTime: userProfile.isFirstimeUser,
          ...tokens,
        },
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.LOGIN_FAILED);
    }
  }
}
