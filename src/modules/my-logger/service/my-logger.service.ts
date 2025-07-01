import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
  async logToFile(entry: string) {
    const formattedEntry = `${Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Lagos',
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date())}\t${entry}\n`;
    try {
      // Verifying and creating the logs directory
      const logsDir = path.resolve(__dirname, '..', '..', 'logs');
      const pathExist = fs.existsSync(logsDir);

      if (!pathExist) {
        console.log('creating directory');
        await fsPromises.mkdir(logsDir, { recursive: true });
      }

      // Writing to the log file
      const logFilePath = path.join(logsDir, 'myLogFile.log');
      await fsPromises.appendFile(logFilePath, formattedEntry);
      console.log(`file written to ${logFilePath}`);
    } catch (e) {
      console.error('Error writing to the log file:', e);
    }
  }

  log(message: any, context?: string) {
    const entry = `${context}\t${message}`;
    void this.logToFile(entry);
    super.log(message, context);
  }

  error(message: any, stackOrContext?: string) {
    const entry = `${stackOrContext}\t${message}`;
    void this.logToFile(entry);
    super.error(message, stackOrContext);
  }

  info(message: any, context?: string) {
    const entry = `${context}\t${message}`;
    void this.logToFile(entry);
    super.verbose(message, context);
  }
}
