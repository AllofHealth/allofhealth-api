
import { registerAs } from '@nestjs/config';

export const flutterwaveConfig = registerAs('flutterwave', () => ({
    clientId: process.env.FLUTTERWAVE_CLIENT_ID,
    clientSecret: process.env.FLUTTERWAVE_CLIENT_SECRET,
    encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY,
    webhookUrl: process.env.FLUTTERWAVE_WEBHOOK_URL,
    webhookSecretKey: process.env.FLUTTERWAVE_WEBHOOK_SECRET_KEY,
    iv: process.env.FLUTTERWAVE_IV,
    baseUrl: process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3',
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
}));
