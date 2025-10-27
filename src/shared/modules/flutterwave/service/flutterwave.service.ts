import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface InitializePaymentParams {
  amount: number;
  currency: string;
  email: string;
  name: string;
  phoneNumber?: string;
  txRef: string;
  redirectUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  status: string;
  message: string;
  data: {
    link: string;
    paymentId: string;
  };
}

export interface VerifyPaymentResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    payment_type: string;
    created_at: string;
    customer: {
      id: number;
      name: string;
      email: string;
      phone_number: string;
    };
    meta?: Record<string, any>;
  };
}

@Injectable()
export class FlutterwaveService {
  private readonly logger = new Logger(FlutterwaveService.name);
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly encryptionKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.getEnvOrThrow('flutterwave.baseUrl');
    this.secretKey = this.getEnvOrThrow('flutterwave.secretKey');
    this.publicKey = this.getEnvOrThrow('flutterwave.publicKey');
    this.encryptionKey = this.getEnvOrThrow('flutterwave.encryptionKey');
  }

  // Utility method to safely fetch required env vars.
  private getEnvOrThrow(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing required configuration value: ${key}`);
    }
    return value;
  }

  // Initialize payment with Flutterwave
  async initializePayment(
    params: InitializePaymentParams,
  ): Promise<PaymentResponse> {
    try {
      this.logger.log(`Initializing Flutterwave payment for ${params.email}`);

      const payload = {
        tx_ref: params.txRef,
        amount: params.amount,
        currency: params.currency,
        redirect_url: params.redirectUrl,
        customer: {
          email: params.email,
          name: params.name,
          phonenumber: params.phoneNumber || '',
        },
        customizations: {
          title: 'AllOf Health Consultation',
          description: `Payment for booking ${params.txRef}`,
          logo: 'https://your-logo-url.com/logo.png',
        },
        meta: params.metadata || {},
      };

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('Flutterwave payment initialization failed', error);
        throw new HttpException(
          `Flutterwave API Error: ${error.message || 'Unknown error'}`,
          response.status,
        );
      }

      const data = await response.json();
      this.logger.log(`Payment initialized: ${data.data.link}`);

      return {
        status: data.status,
        message: data.message,
        data: {
          link: data.data.link,
          paymentId: data.data.id,
        },
      };
    } catch (error) {
      this.logger.error('Failed to initialize Flutterwave payment', error);
      throw error;
    }
  }

  // Verify payment transaction
  async verifyPayment(transactionId: string): Promise<VerifyPaymentResponse> {
    try {
      this.logger.log(`Verifying Flutterwave transaction: ${transactionId}`);

      const response = await fetch(
        `${this.baseUrl}/transactions/${transactionId}/verify`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          `Flutterwave API Error: ${error.message}`,
          response.status,
        );
      }

      const data = await response.json();
      this.logger.log(`Transaction verified: ${data.data.status}`);

      return data;
    } catch (error) {
      this.logger.error('Failed to verify payment', error);
      throw error;
    }
  }

  // Process refund
  async processRefund(transactionId: string, amount?: number): Promise<any> {
    try {
      this.logger.log(`Processing refund for transaction: ${transactionId}`);

      const payload = {
        id: transactionId,
        ...(amount && { amount }),
      };

      const response = await fetch(
        `${this.baseUrl}/transactions/${transactionId}/refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.secretKey}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          `Flutterwave Refund Error: ${error.message}`,
          response.status,
        );
      }

      const data = await response.json();
      this.logger.log(`Refund processed: ${data.data.id}`);

      return data;
    } catch (error) {
      this.logger.error('Failed to process refund', error);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secretHash = this.configService.get<string>(
      'flutterwave.webhookSecretKey',
    );

    if (!secretHash) {
      this.logger.warn('Webhook secret key not configured');
      return false;
    }

    // Flutterwave sends signature in verif-hash header
    return signature === secretHash;
  }

  // Encrypt payment data (for card payments)
  encryptPaymentData(data: Record<string, any>): string {
    const text = JSON.stringify(data);
    const iv = this.configService.get<string>('flutterwave.iv');
    if (!iv) {
      throw new Error('Missing Flutterwave IV');
    }
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'utf8'),
      Buffer.from(iv, 'utf8'),
    );

    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
  }

  // Get payment configuration for frontend
  getPaymentConfig() {
    return {
      publicKey: this.publicKey,
      currency: 'USD',
      country: 'US',
    };
  }
}
