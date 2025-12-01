import {
  EXPIRES_IN,
  IS_PRODUCTION,
  PROD_URL,
  STAGING_URL,
} from '../data/constants';

export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: EXPIRES_IN,
  },
  database: {
    url: IS_PRODUCTION ? PROD_URL : STAGING_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
  },
});
