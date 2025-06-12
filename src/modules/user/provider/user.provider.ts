import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { err, ok, ResultAsync } from 'neverthrow';
import { USER_ERROR_MESSAGES } from '../data/user.data';
import { UserError } from '../error/user.error';

@Injectable()
export class UserProvider {
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: Database) {}

  async validateEmailAddress(emailAddress: string) {
    const result = await ResultAsync.fromThrowable(
      () => this.findUserByEmail(emailAddress),
      (error: Error) =>
        new UserError(`Failed to validate email ${error.message}`),
    )().andThen((user) => {
      if (!user) {
        return ok(false);
      }

      return ok(true);
    });

    return result;
  }

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

  async findUserById(id: string) {
    const result = await ResultAsync.fromPromise(
      this.db.select().from(schema.user).where(eq(schema.user.id, id)),
      (error: Error) =>
        new UserError(`Failed to find user by id ${error.message}`),
    ).andThen((user) => {
      if (!user) {
        return err(new UserError(USER_ERROR_MESSAGES.USER_NOT_FOUND));
      }

      return ok(user[0]);
    });

    return result;
  }
}
