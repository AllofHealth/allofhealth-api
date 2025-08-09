import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { monthNumberToName } from '@/shared/utils/date.utils';
import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import {
  HealthJournalErrorMessages as HEM,
  HealthJournalSuccessMessages as HSM,
  MOOD_INDEX,
} from '../data/health-journal.data';
import {
  ICalculateMoodScore,
  ICreateMetrics,
  IFetchJournalMetrics,
  TMood,
} from '../interface/health-journal.interface';
import { SharedEvents } from '@/shared/events/shared.events';
import { EUpdateMoodMetrics } from '@/shared/dtos/event.dto';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class JournalMetricsProvider {
  private readonly logger = new MyLoggerService(JournalMetricsProvider.name);
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
  ) {}

  private async validateMonthlyMetricsExist(userId: string) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    try {
      const monthlyMoodMetrics = await this.db
        .select()
        .from(schema.moodMetrics)
        .where(
          and(
            eq(schema.moodMetrics.userId, userId),
            eq(schema.moodMetrics.year, currentYear),
            eq(schema.moodMetrics.month, currentMonth),
          ),
        );

      return monthlyMoodMetrics.length > 0;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  private convertMoodToIndex(mood: TMood) {
    switch (mood) {
      case 'bad':
        return MOOD_INDEX.BAD;
      case 'low':
        return MOOD_INDEX.LOW;
      case 'neutral':
        return MOOD_INDEX.NEUTRAL;
      case 'good':
        return MOOD_INDEX.GOOD;
      case 'great':
        return MOOD_INDEX.GREAT;
    }
  }

  private convertScoreToMood(score: number): TMood {
    const roundedScore = Math.round(score);
    switch (roundedScore) {
      case MOOD_INDEX.BAD:
        return 'bad';
      case MOOD_INDEX.LOW:
        return 'low';
      case MOOD_INDEX.NEUTRAL:
        return 'neutral';
      case MOOD_INDEX.GOOD:
        return 'good';
      case MOOD_INDEX.GREAT:
        return 'great';
      default:
        if (roundedScore < MOOD_INDEX.BAD) return 'bad';
        if (roundedScore > MOOD_INDEX.GREAT) return 'great';
        return 'neutral';
    }
  }

  private async calculateMonthlyAverageMoodScore(ctx: ICalculateMoodScore) {
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

      let moodScores: number[] = [];

      for (const journal of monthlyJournal) {
        moodScores.push(this.convertMoodToIndex(journal.mood as TMood));
      }

      if (moodScores.length === 0) {
        return 3;
      } else {
        const averageMoodScore =
          moodScores.reduce((acc, score) => acc + score, 0) / moodScores.length;

        return averageMoodScore;
      }
    } catch (e) {
      this.logger.debug(e);
      throw new InternalServerErrorException(
        `${HEM.ERROR_CALCULATING_MONTHLY_AVERAGE_MOOD_SCORE}, ${e}`,
      );
    }
  }

  private async calculateYearlyAverageMoodScore(userId: string, year: number) {
    try {
      const yearlyMetrics = await this.db
        .select()
        .from(schema.moodMetrics)
        .where(
          and(
            eq(schema.moodMetrics.userId, userId),
            eq(schema.moodMetrics.year, year),
          ),
        );

      if (yearlyMetrics.length === 0) {
        return 2;
      }

      const moodScores = yearlyMetrics
        .filter((metric) => metric.averageMoodLevel !== null)
        .map((metric) =>
          this.convertMoodToIndex(metric.averageMoodLevel as TMood),
        );

      if (moodScores.length === 0) {
        return 2;
      }

      const averageScore =
        moodScores.reduce((acc, score) => acc + score, 0) / moodScores.length;
      return averageScore;
    } catch (e) {
      this.logger.debug(e);
      throw new InternalServerErrorException(
        `Error calculating yearly average mood score: ${e}`,
      );
    }
  }

  private async fetchYearMetrics(userId: string, year: number) {
    try {
      const yearMetrics = await this.db
        .select()
        .from(schema.moodMetrics)
        .where(
          and(
            eq(schema.moodMetrics.userId, userId),
            eq(schema.moodMetrics.year, year),
          ),
        );

      let averageMoodLevel: TMood = 'neutral';
      let averageMoodScore = 2;

      if (yearMetrics.length > 0) {
        averageMoodScore = await this.calculateYearlyAverageMoodScore(
          userId,
          year,
        );
        averageMoodLevel = this.convertScoreToMood(averageMoodScore);
      }

      return {
        year,
        averageMoodLevel,
        averageMoodScore,
        monthsWithData: yearMetrics.length,
        hasData: yearMetrics.length > 0,
      };
    } catch (error) {
      this.logger.debug(`Error fetching metrics for year ${year}: ${error}`);
      return {
        year,
        averageMoodLevel: 'neutral' as TMood,
        averageMoodScore: 2,
        monthsWithData: 0,
        hasData: false,
      };
    }
  }

  private async createHealthJournalMetrics(ctx: ICreateMetrics) {
    const { userId, year = new Date().getFullYear() } = ctx;
    try {
      let createdCount = 0;
      let skippedCount = 0;

      const existingJournalMetrics = await this.db
        .select({ month: schema.moodMetrics.month })
        .from(schema.moodMetrics)
        .where(
          and(
            eq(schema.moodMetrics.userId, userId),
            eq(schema.moodMetrics.year, year),
          ),
        );

      const existingMonths = new Set(
        existingJournalMetrics.map((metric) => metric.month),
      );

      const metricsToCreate: any[] = [];
      for (let month = 1; month <= 12; month++) {
        if (!existingMonths.has(month)) {
          metricsToCreate.push({
            userId,
            year,
            month,
            averageMoodLevel: 'neutral',
          });
          createdCount++;
        } else {
          skippedCount++;
        }
      }

      if (metricsToCreate.length > 0) {
        const createdMetrics = await this.db
          .insert(schema.moodMetrics)
          .values(metricsToCreate)
          .returning();

        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: `${HSM.SUCCESS_CREATING_HEALTH_JOURNAL_METRICS} - Created: ${createdCount}, Skipped: ${skippedCount}`,
          data: createdMetrics,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: `${HSM.SUCCESS_CREATING_HEALTH_JOURNAL_METRICS} - Created: ${createdCount}, Skipped: ${skippedCount}`,
        data: [],
      });
    } catch (e) {
      return this.handler.handleError(
        e,
        HEM.ERROR_CREATING_HEALTH_JOURNAL_METRICS,
      );
    }
  }

  @OnEvent(SharedEvents.UPDATE_MOOD_METRICS)
  async updateMonthlyMood(ctx: EUpdateMoodMetrics) {
    this.logger.debug(`Updating monthly mood metrics for user ${ctx.userId}`);
    const { userId, month = new Date().getMonth() } = ctx;
    const currentYear = new Date().getFullYear();

    try {
      const metricsExist = await this.validateMonthlyMetricsExist(userId);
      if (!metricsExist) {
        return await this.createHealthJournalMetrics({ userId });
      }

      const monthlyMoodScore = await this.calculateMonthlyAverageMoodScore({
        userId,
        month,
      });

      const moodString = this.convertScoreToMood(monthlyMoodScore);

      await this.db
        .update(schema.moodMetrics)
        .set({ averageMoodLevel: moodString })
        .where(
          and(
            eq(schema.moodMetrics.userId, userId),
            eq(schema.moodMetrics.year, currentYear),
            eq(schema.moodMetrics.month, month),
          ),
        );

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: HSM.SUCCESS_UPDATING_HEALTH_JOURNAL_METRICS,
        data: {
          month,
          year: currentYear,
          averageMoodScore: monthlyMoodScore,
          averageMoodLevel: moodString,
        },
      });
    } catch (e) {
      return this.handler.handleError(
        e,
        HEM.ERROR_UPDATING_HEALTH_JOURNAL_METRICS,
      );
    }
  }

  async fetchHealthJournalMetrics(ctx: IFetchJournalMetrics) {
    const { userId, year = new Date().getFullYear(), duration } = ctx;

    try {
      switch (duration) {
        case 'monthly':
          const metrics = await this.db
            .select()
            .from(schema.moodMetrics)
            .where(
              and(
                eq(schema.moodMetrics.userId, userId),
                eq(schema.moodMetrics.year, year),
              ),
            );

          if (!metrics.length) {
            const createdMetrics = await this.createHealthJournalMetrics({
              userId,
              year,
            });

            if (
              !createdMetrics ||
              !('data' in createdMetrics) ||
              createdMetrics.data === null ||
              createdMetrics.data.length === 0
            ) {
              return this.handler.handleReturn({
                status: HttpStatus.EXPECTATION_FAILED,
                message: HEM.ERROR_CREATING_HEALTH_JOURNAL_METRICS,
              });
            }

            const parsedMetrics = createdMetrics.data.map((metric) => {
              return {
                mood: metric.averageMoodLevel,
                month: monthNumberToName(metric.month, 'abbreviated'),
              };
            });

            return this.handler.handleReturn({
              status: HttpStatus.CREATED,
              message: HSM.SUCCESS_FETCHING_JOURNAL_METRICS,
              data: parsedMetrics,
            });
          }

          const parsedMetrics = metrics.map((metric) => {
            return {
              mood: metric.averageMoodLevel,
              month: monthNumberToName(metric.month, 'abbreviated'),
            };
          });

          return this.handler.handleReturn({
            status: HttpStatus.CREATED,
            message: HSM.SUCCESS_FETCHING_JOURNAL_METRICS,
            data: parsedMetrics,
          });
        case 'yearly':
          if (year && year !== new Date().getFullYear()) {
            const currentYear = new Date().getFullYear();
            const minYear = currentYear - 11;

            if (year < minYear || year > currentYear) {
              return this.handler.handleReturn({
                status: HttpStatus.BAD_REQUEST,
                message: `Year must be between ${minYear} and ${currentYear}`,
              });
            }

            const yearMetric = await this.fetchYearMetrics(userId, year);
            return this.handler.handleReturn({
              status: HttpStatus.OK,
              message: HSM.SUCCESS_FETCHING_JOURNAL_METRICS,
              data: [yearMetric],
            });
          }

          const currentYear = new Date().getFullYear();
          const startYear = currentYear - 11;
          const yearlyData: any[] = [];

          const yearPromises: any[] = [];
          for (
            let yearIterator = startYear;
            yearIterator <= currentYear;
            yearIterator++
          ) {
            yearPromises.push(this.fetchYearMetrics(userId, yearIterator));
          }

          const results = await Promise.all(yearPromises);
          yearlyData.push(...results);

          return this.handler.handleReturn({
            status: HttpStatus.OK,
            message: HSM.SUCCESS_FETCHING_JOURNAL_METRICS,
            data: yearlyData,
            meta: {
              totalYears: yearlyData.length,
              yearsWithData: yearlyData.filter((y) => y.hasData).length,
              overallAverageMood: this.convertScoreToMood(
                yearlyData
                  .filter((y) => y.hasData)
                  .reduce((acc, y) => acc + y.averageMoodScore, 0) /
                  (yearlyData.filter((y) => y.hasData).length || 1),
              ),
            },
          });
        default:
          return this.handler.handleReturn({
            status: HttpStatus.BAD_REQUEST,
            message: 'Invalid duration. Must be "monthly" or "yearly"',
          });
      }
    } catch (e) {
      return this.handler.handleError(
        e,
        HEM.ERROR_FETCHING_HEALTH_JOURNAL_METRICS,
      );
    }
  }
}
