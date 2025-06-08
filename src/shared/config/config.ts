import { EXPIRES_IN } from '../data/constants';

export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: EXPIRES_IN,
  },
});
