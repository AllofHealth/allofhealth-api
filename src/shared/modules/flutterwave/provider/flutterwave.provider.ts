import { FlutterwaveConfig } from '@/shared/config/flutterwave/flutterwave.config';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  IHandleFlutterRequest,
  TFlutterMethods,
} from '../interface/flutterwave.interface';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { APP_ENV } from '@/shared/data/constants';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FlutterwaveProvider {
  private readonly logger = new MyLoggerService(FlutterwaveProvider.name);
  constructor(
    private readonly flutterwaveConfig: FlutterwaveConfig,
    private readonly httpService: HttpService,
  ) {}

  private getRequestConfig(method: TFlutterMethods): AxiosRequestConfig {
    return {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.flutterwaveConfig.FLUTTERWAVE_CLIENT_SECRET}`,
      },
    };
  }

  provideBaseUrl() {
    return APP_ENV === 'PRODUCTION'
      ? this.flutterwaveConfig.FLUTTERWAVE_PROD_BASE_URL
      : this.flutterwaveConfig.FLUTTERWAVE_SANDBOX_BASE_URL;
  }

  async handleFlutterRequest(ctx: IHandleFlutterRequest) {
    this.logger.log(`Handling request for ${ctx.url}, ${ctx.src}`);
    const { src, method, url, data } = ctx;

    const config: AxiosRequestConfig = {
      ...this.getRequestConfig(method),
      url,
      data,
    };

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.request(config),
      );

      return response.data;
    } catch (e) {
      this.logger.error(
        `An error occurred while making request to this resource ${src}: ${e} `,
      );
      throw new HttpException(
        `An error occurred while making request to this resource ${src}: ${e}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getPaymentConfig() {
    return {
      publicKey: this.flutterwaveConfig.FLUTTERWAVE_CLIENT_ID,
      currency: 'USD',
      country: 'US',
    };
  }
}
