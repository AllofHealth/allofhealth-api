import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HealthJournalService } from '../service/health-journal.service';
import {
  HealthJournalErrorMessages as HEM,
  HealthJournalSuccessMessages as HSM,
  MOOD_INDEX,
} from '../data/health-journal.data';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import {
  ICalculateMonthlyAverageMoodScore,
  TMood,
} from '../interface/health-journal.interface';
import { monthNameToNumber } from '@/shared/utils/date.utils';

@Injectable()
export class JournalMetrics {
  private readonly logger = new MyLoggerService(JournalMetrics.name);
  constructor(private readonly journalService: HealthJournalService) {}

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

  private async calculateMonthlyAverageMoodScore(
    ctx: ICalculateMonthlyAverageMoodScore,
  ) {
    const { userId, month } = ctx;
    try {
      const monthIndex = monthNameToNumber(month);
      const monthlyJournal = await this.journalService.fetchMonthlyJournal({
        userId,
        month: monthIndex,
      });

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
}
