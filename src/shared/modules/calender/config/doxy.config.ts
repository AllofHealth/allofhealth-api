import { registerAs } from '@nestjs/config';

export const doxyConfig = registerAs('doxy', () => ({
    baseUrl: process.env.DOXY_BASE_URL,
    clinicSubdomain: process.env.DOXY_CLINIC_SUBDOMAIN,
    defaultProviderRoom: process.env.DOXY_DEFAULT_PROVIDER_ROOM,
    webhookSecret: process.env.DOXY_WEBHOOK_SECRET,
    apiKey: process.env.DOXY_API_KEY, // If Chike provides one later
    // Doxy room URL format: https://allofHealth.doxy.me/{providerRoom}?pid={patientId}
}));