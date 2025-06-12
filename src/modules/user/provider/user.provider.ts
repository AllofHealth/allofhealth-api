import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { Inject, Injectable } from '@nestjs/common';
import { err, ok, ResultAsync } from 'neverthrow';
import * as schema from '@/schemas/schema';
import { eq } from 'drizzle-orm';
import { UserError } from '../error/user.error';
import { USER_ERROR_MESSAGES } from '../data/user.data';

@Injectable()
export class UserProvider {
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: Database) {}

  async findUserByEmail(emailAddress: string) {
    const result = await ResultAsync.fromPromise(
      this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.emailAddress, emailAddress)),
      (error: Error) =>
        new UserError(`Failed to find user by email ${error.message}`),
    ).andThen((users) => {
      if (!users || users.length === 0) {
        return err(new UserError(USER_ERROR_MESSAGES.USER_NOT_FOUND));
      }

      return ok(users[0]);
    });

    return result;
  }
}
