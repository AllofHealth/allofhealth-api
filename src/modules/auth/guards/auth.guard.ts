import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { HttpStatus } from '@nestjs/common';

import { TokenService } from '@/modules/token/service/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly logger: MyLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      const payload = await this.jwtService.verify(token);
      const userIdFromPayload = payload.userId;
      console.log(userIdFromPayload);

      if (!userIdFromPayload) {
        throw new UnauthorizedException('Invalid token payload');
      }
      const userTokenResult =
        await this.tokenService.fetchUserToken(userIdFromPayload);

      if (
        userTokenResult.status !== HttpStatus.FOUND ||
        !('data' in userTokenResult && userTokenResult.data)
      ) {
        throw new UnauthorizedException('No valid session found for user');
      }

      if (userTokenResult.data.userId !== userIdFromPayload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const userToken = userTokenResult.data;
      const now = new Date();

      if (userToken.revokedAt || userToken.expiresAt < now) {
        throw new UnauthorizedException('Session has expired or been revoked');
      }

      request.tokenId = userToken.id;
      return true;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token signature');
      } else if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractToken(request: Request): string | undefined {
    // @ts-expect-error authorization key will be added to the request header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');

    return type === 'Bearer' ? token : undefined;
  }
}
