import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import * as schema from '@/schemas/schema';
import { eq } from 'drizzle-orm';
import { UserError } from '@/modules/user/error/user.error';
import { USER_STATUS } from '@/modules/user/data/user.data';

@Injectable()
export class SuspensionGuard implements CanActivate {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly jwtService: JwtService,
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
      const userId = payload.userId;
      const status = await this.db
        .select({
          status: schema.user.status,
        })
        .from(schema.user)
        .where(eq(schema.user.id, userId));

      if (!status || status.length === 0) {
        throw new NotFoundException(
          new UserError('User not found', HttpStatus.NOT_FOUND),
        );
      }

      const userStatus = status[0].status;
      if (userStatus === USER_STATUS.SUSPENDED) {
        throw new ForbiddenException('User is suspended');
      }

      return true;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token signature');
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractToken(request: Request): string | undefined {
    // @ts-expect-error authorization key will be added to the request header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return;
    }

    const [type, token] = authHeader.split(' ');

    return type === 'Bearer' ? token : undefined;
  }
}
