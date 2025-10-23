import { registerAs } from '@nestjs/config';

export const calcomConfig = registerAs('calcom', () => ({
    apiKey: process.env.CALCOM_API_KEY,
    apiUrl: process.env.CALCOM_API_URL,
    webhookSecret: process.env.CALCOM_WEBHOOK_SECRET,
    clientId: process.env.CALCOM_CLIENT_ID,
    clientSecret: process.env.CALCOM_CLIENT_SECRET,
    redirectUri: process.env.CALCOM_REDIRECT_URI,
    embedUrl: process.env.CALCOM_EMBED_URL,
}));