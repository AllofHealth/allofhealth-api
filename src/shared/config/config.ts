import { EXPIRES_IN } from '../data/constants';

export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: EXPIRES_IN,
  },
  database: {
    url:
      process.env.NODE_ENV === 'production'
        ? process.env.DATABASE_URL
        : process.env.DATABASE_URL_STAGING,
  },
});
