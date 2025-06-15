import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { UserService } from '@/modules/user/service/user.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  private readonly logger = new MyLoggerService(OwnerGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      const payload = await this.jwtService.verify(token);
      const tokenUserId = payload.userId;

      console.log('Token payload:', payload);

      const requestedUserId = this.extractUserId(request);

      console.log(`Requested user ID: ${requestedUserId}`);

      this.logger.log(
        `Verifying ownership: Token user ID ${tokenUserId}, Requested user ID ${requestedUserId}`,
      );

      if (tokenUserId !== requestedUserId) {
        this.logger.warn(
          `Unauthorized access attempt: User ${tokenUserId} tried to access data for user ${requestedUserId}`,
        );
        throw new UnauthorizedException(
          'You can only access or modify your own data',
        );
      }

      request.user = { userId: tokenUserId };

      await this.userService.updateUser({
        id: tokenUserId,
        lastActivityDate: new Date(),
      });

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

  private extractToken(request: any): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');

    return type === 'Bearer' ? token : undefined;
  }

  private extractUserId(request: any) {
    console.log(`Extracting request body => ${request.body}`);
    try {
      let userId = request.query.userId;
      if (!userId || userId === undefined) {
        userId = request.body.userId;
      }

      return userId;
    } catch (error) {
      console.error(`error extracting userId`, error);
    }
  }
}
