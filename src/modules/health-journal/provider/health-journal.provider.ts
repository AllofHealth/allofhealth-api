import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@/schemas/schema';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  HealthJournalErrorMessages as HEM,
  HealthJournalSuccessMessages as HSM,
} from '../data/health-journal.data';
import {
  IAddEntry,
  IFetchJournal,
  IFetchJournalMetrics,
  IFetchMonthlyJournal,
} from '../interface/health-journal.interface';
import { and, eq, sql } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EOnUserLogin,
  EUpdateMoodMetrics,
  EUpdateTaskCount,
} from '@/shared/dtos/event.dto';
import { SharedEvents } from '@/shared/events/shared.events';
import { JournalMetricsProvider } from './journal-metrics.provider';
import { UserService } from '@/modules/user/service/user.service';

@Injectable()
export class HealthJournalProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
    private readonly journalMetricsProvider: JournalMetricsProvider,
  ) {}

  private formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  async fetchMonthlyJournal(ctx: IFetchMonthlyJournal) {
    const { userId, month } = ctx;
    try {
      const year = new Date().getFullYear();

      const monthlyJournal = await this.db
        .select()
        .from(schema.health_journal)
        .where(
          and(
            eq(schema.health_journal.userId, userId),
            sql`EXTRACT(MONTH FROM ${schema.health_journal.createdAt}) = ${month}`,
            sql`EXTRACT(YEAR FROM ${schema.health_journal.createdAt}) = ${year}`,
          ),
        );

      const formattedJournal = monthlyJournal.map((entry) => ({
        ...entry,
        createdAt: this.formatDate(entry.createdAt),
        updatedAt: this.formatDate(entry.updatedAt),
      }));

      return formattedJournal;
    } catch (e) {
      throw new InternalServerErrorException(
        `${HEM.ERROR_FETCHING_MONTHLY_JOURNAL}, ${e}`,
      );
    }
  }

  async addJournalEntry(ctx: IAddEntry) {
    const { userId, mood, activities, symptoms, tags } = ctx;
    try {
      await this.userService.checkUserSuspension(userId);
      const journal = await this.db
        .insert(schema.health_journal)
        .values({
          userId,
          mood: mood.toLowerCase(),
          activities,
          symptoms,
          tags,
        })
        .returning();

      if (!journal || journal.length === 0) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: HEM.ERROR_ADDING_ENTRY,
        });
      }

      const taskData = new EUpdateTaskCount(
        userId,
        'ADD_HEALTH_JOURNAL',
        journal[0].id,
      );
      this.eventEmitter.emit(SharedEvents.TASK_COMPLETED, taskData);
      this.eventEmitter.emit(
        SharedEvents.UPDATE_MOOD_METRICS,
        new EUpdateMoodMetrics(userId),
      );
      this.eventEmitter.emit(
        SharedEvents.UPDATE_USER_LOGIN,
        new EOnUserLogin(userId, new Date(), new Date()),
      );
      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: HSM.SUCCESS_ADDING_ENTRY,
      });
    } catch (e) {
      return this.handler.handleError(e, HEM.ERROR_ADDING_ENTRY);
    }
  }

  async fetchUserJournal(ctx: IFetchJournal) {
    const { userId, page = 1, limit = 12 } = ctx;
    const skip = (page - 1) * limit;
    try {
      const totalJournalCount = await this.db
        .select({ count: sql`count(*)`.as('count') })
        .from(schema.health_journal)
        .where(eq(schema.health_journal.userId, userId));

      const totalCount = Number(totalJournalCount[0].count ?? 0);
      const totalPages = Math.ceil(totalCount / limit);

      const journal = await this.db
        .select()
        .from(schema.health_journal)
        .where(eq(schema.health_journal.userId, userId))
        .limit(limit)
        .offset(skip);

      const formattedJournal = journal.map((entry) => ({
        ...entry,
        createdAt: this.formatDate(entry.createdAt),
        updatedAt: this.formatDate(entry.updatedAt),
      }));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: HSM.SUCCESS_FETCHING_JOURNAL,
        data: {
          journal: formattedJournal,
        },
        meta: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (e) {
      return this.handler.handleError(e, HEM.ERROR_FETCHING_JOURNAL);
    }
  }

  async fetchJournalMetrics(ctx: IFetchJournalMetrics) {
    return await this.journalMetricsProvider.fetchHealthJournalMetrics(ctx);
  }
}
