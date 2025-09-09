import { Injectable } from '@nestjs/common';
import { MyLoggerService } from './modules/my-logger/service/my-logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: MyLoggerService) {
    this.logger.setContext(AppService.name);
  }
  getHello(): string {
    return 'Hello World!';
  }

  testSentry() {
    this.logger.log('Log from custom logger');
    console.log('Test Sentry');

    this.logger.error('Error from custom logger');
    console.error('Error from console');
    throw new Error('Test error');
  }

  testAllLogLevels() {
    this.logger.log('This is a log message');
    this.logger.info('This is an info message');
    this.logger.warn('This is a warning message');
    this.logger.error('This is an error message');

    this.logger.log('Log with context', 'TestContext');
    this.logger.error('Error with context', 'TestContext');

    const testError = new Error('Test error object');
    this.logger.error(testError);

    return 'All log levels tested - check Sentry dashboard';
  }
}
