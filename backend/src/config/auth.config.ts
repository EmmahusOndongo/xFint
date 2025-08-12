export const AUTH = {
  ACCESS: {
    SECRET: process.env.JWT_ACCESS_SECRET!,
    EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES || '1h',
    COOKIE: process.env.AUTH_COOKIE_ACCESS || 'sh_access',
  },
  REFRESH: {
    SECRET: process.env.JWT_REFRESH_SECRET!,
    EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES || '7d',
    COOKIE: process.env.AUTH_COOKIE_REFRESH || 'sh_refresh',
  },
};
