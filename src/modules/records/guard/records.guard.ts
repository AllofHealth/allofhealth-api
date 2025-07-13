import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';

@Injectable()
export class RecordsGuard implements CanActivate {
  private readonly logger = new MyLoggerService(RecordsGuard.name);

  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly jwtService: JwtService,
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

      const doctor = await this.db.query.doctors.findFirst({
        where: eq(schema.doctors.id, tokenUserId),
      });

      if (!doctor || typeof doctor === undefined) {
        throw new UnauthorizedException('Doctor not found');
      }

      if (!doctor.isVerified) {
        throw new UnauthorizedException('Doctor not verified');
      }

      await this.db.update(schema.doctors).set({
        id: tokenUserId,
        updatedAt: new Date().toISOString(),
      });

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

  private extractToken(request: any): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return;
    }

    const [type, token] = authHeader.split(' ');

    return type === 'Bearer' ? token : undefined;
  }
}
