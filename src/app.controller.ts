import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/debug-sentry')
  getError() {
    this.appService.testSentry();
  }

  @Get('/test-logs')
  testLogs() {
    return this.appService.testAllLogLevels();
  }
}
