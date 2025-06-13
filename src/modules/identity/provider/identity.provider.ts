import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { err, ResultAsync } from 'neverthrow';
import { IdentityError } from '../error/identity.error';
import { IStoreIdentification } from '../interface/identity.interface';

@Injectable()
export class IdentityProvider {
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: Database) {}

  private fetchUser(userId: string) {
    return ResultAsync.fromPromise(
      this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1),
      (error: Error) => new IdentityError(error.message),
    );
  }

  storeId(ctx: IStoreIdentification) {
    return this.fetchUser(ctx.userId).andThen((user) => {
      if (user.length === 0) {
        return err(new IdentityError(`user not found`));
      }

      switch (ctx.role) {
        case 'DOCTOR':
          if (!ctx.scannedLicense) {
            return err(new IdentityError('scanned license is required'));
          }

          return ResultAsync.fromPromise(
            this.db
              .insert(schema.identity)
              .values({
                userId: ctx.userId,
                governmentId: ctx.governmentId,
                scannedLicense: ctx.scannedLicense,
                role: 'DOCTOR',
              })
              .returning(),
            (error: Error) => new IdentityError(error.message),
          ).map((identity) => ({
            id: identity[0].id,
          }));

        case 'PATIENT':
          return ResultAsync.fromPromise(
            this.db
              .insert(schema.identity)
              .values({
                userId: ctx.userId,
                governmentId: ctx.governmentId,
                role: 'PATIENT',
              })
              .returning(),
            (error: Error) => new IdentityError(error.message),
          ).map((identity) => ({
            id: identity[0].id,
          }));

        default:
          return err(new IdentityError(`invalid role`));
      }
    });
  }
}
