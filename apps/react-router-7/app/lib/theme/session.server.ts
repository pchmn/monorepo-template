import { createCookieSessionStorage } from 'react-router';
import { createThemeSessionResolver } from 'remix-themes';

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__rr7-theme',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
