import { EXPIRES_IN } from '../data/constants';

export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: EXPIRES_IN,
  },
  database: {
    url:
      process.env.NODE_ENV === 'PRODUCTION'
        ? process.env.DATABASE_URL
        : process.env.DATABASE_URL_STAGING,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
  },
});
