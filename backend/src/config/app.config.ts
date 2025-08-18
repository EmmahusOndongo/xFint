export const APP = {
  PORT: Number(process.env.PORT || 5000),
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
};
