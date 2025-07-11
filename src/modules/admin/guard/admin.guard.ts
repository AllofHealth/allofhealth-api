import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as schema from '@/schemas/schema';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: Database) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.query.userId;

    try {
      const admin = await this.db.query.admin.findFirst({
        where: eq(schema.admin.id, userId),
      });

      if (!admin || typeof admin === undefined) {
        throw new UnauthorizedException();
      }
      return true;
    } catch (e) {
      throw new HttpException(
        'Error validating admin status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
