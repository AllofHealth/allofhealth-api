import { TokenService } from '@/modules/token/service/token.service';
import { ICreateUser } from '@/modules/user/interface/user.interface';
import { UserService } from '@/modules/user/service/user.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthErrorMessage as AEM,
  AuthSuccessMessage as ASM,
} from '../data/auth.data';
import { AuthError } from '../error/auth.error';
import { IJwtPayload } from '../interface/auth.interface';

@Injectable()
export class AuthProvider {
  private handler: ErrorHandler;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {
    this.handler = new ErrorHandler();
  }

  private async generateTokens(payload: { userId: string; email: string }) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
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

      if (!tokens.accessToken || !tokens.refreshToken) {
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
}
