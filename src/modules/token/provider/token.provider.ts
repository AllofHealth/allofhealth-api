import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNull } from 'drizzle-orm';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import type { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { TokenErrorMessages, TokenSuccessMessages } from '../data/token.data';
import type {
  ICreateRefreshToken,
  IFindValidToken,
  IRevokeToken,
} from '../interface/token.interface';

@Injectable()
export class TokenProvider {
  private handler: ErrorHandler;

  constructor(
    @Inject(DRIZZLE_PROVIDER)
    private readonly db: Database,
  ) {
    this.handler = new ErrorHandler();
  }

  async fetchUserToken(userId: string) {
    try {
      const [token] = await this.db
        .select()
        .from(schema.refresh_tokens)
        .where(eq(schema.refresh_tokens.userId, userId))
        .limit(1);

      if (!token) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: TokenErrorMessages.ERROR_FINDING_VALID_TOKEN,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.FOUND,
        message: TokenSuccessMessages.USER_TOKEN_FOUND,
        data: token,
      });
    } catch (e) {
      return this.handler.handleError(
        e,
        TokenErrorMessages.ERROR_FINDING_VALID_TOKEN,
      );
    }
  }

  async createRefreshToken(args: ICreateRefreshToken) {
    const { expiresIn, token, userId } = args;
    try {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

      await this.db
        .insert(schema.refresh_tokens)
        .values({
          userId,
          token,
          expiresAt,
        })
        .onConflictDoUpdate({
          target: schema.refresh_tokens.userId,
          set: {
            token,
            expiresAt,
            revokedAt: null,
          },
        });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: TokenSuccessMessages.TOKEN_CREATED,
      });
    } catch (e) {
      return this.handler.handleError(
        e,
        TokenErrorMessages.ERROR_CREATING_REFRESH_TOKEN,
      );
    }
  }

  async findValidToken(args: IFindValidToken) {
    const { userId, token } = args;
    try {
      const [result] = await this.db
        .select()
        .from(schema.refresh_tokens)
        .where(
          and(
            eq(schema.refresh_tokens.userId, userId),
            eq(schema.refresh_tokens.token, token),
          ),
        );
      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: TokenSuccessMessages.FOUND_VALID_TOKEN,
        data: result,
      });
    } catch (e) {
      return this.handler.handleError(
        e,
        TokenErrorMessages.ERROR_FINDING_VALID_TOKEN,
      );
    }
  }

  async revokeToken(args: IRevokeToken) {
    const { userId, replacementToken } = args;
    try {
      if (replacementToken) {
        const [result] = await this.db
          .update(schema.refresh_tokens)
          .set({
            token: replacementToken,
            revokedAt: null,
            replacedByToken: null,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          })
          .where(eq(schema.refresh_tokens.userId, userId))
          .returning();

        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: TokenSuccessMessages.TOKEN_REVOKED,
          data: result,
        });
      } else {
        const [result] = await this.db
          .update(schema.refresh_tokens)
          .set({
            revokedAt: new Date(),
          })
          .where(eq(schema.refresh_tokens.userId, userId))
          .returning();

        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: TokenSuccessMessages.TOKEN_REVOKED,
          data: result,
        });
      }
    } catch (e) {
      return this.handler.handleError(
        e,
        TokenErrorMessages.ERROR_REVOKING_TOKEN,
      );
    }
  }
}
