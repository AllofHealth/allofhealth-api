import { Injectable } from '@nestjs/common';
import * as ics from 'ics';
import { IGenerateIcsFile } from '../interface/ics.interface';
import { ICS_DATA } from '../data/ics.data';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { IcsError } from '../error/ics.error';

@Injectable()
export class IcsService {
  private readonly logger = new MyLoggerService(IcsService.name);
  constructor() {}
  private dateToArray(date: Date): [number, number, number, number, number] {
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
    ];
  }

  generateIcsFile(ctx: IGenerateIcsFile) {
    const event: ics.EventAttributes = {
      start: this.dateToArray(ctx.startTime),
      end: this.dateToArray(ctx.endTime),
      title: ctx.title,
      description: ctx.description,
      location: ctx.url,
      url: ctx.url,
      status: 'CONFIRMED',
      organizer: {
        name: ICS_DATA.ORGANIZER_NAME,
        email: ICS_DATA.EMAIL,
      },
    };

    const { error, value } = ics.createEvent(event);
    if (error) {
      this.logger.error(`Failed to generate ics: ${error.message}`);
      throw new IcsError(error.message, { cause: error.cause });
    }

    return value;
  }
}
