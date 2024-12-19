import { type CookieSerializeOptions, useSession } from 'vinxi/http';
import { type Theme, isTheme } from '../theme-provider';

const COOKIE_NAME = '__tanstart_theme';
const COOKIE_PASSWORD =
  'should-not-need-password-because-cookie-is-not-sensitive';
const COOKIE_OPTIONS: CookieSerializeOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export const themeValidator = (data: unknown): { theme: Theme } => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Theme must be an object');
  }

  if ('theme' in data && !isTheme(data.theme)) {
    throw new Error('Theme.theme must be a valid theme');
  }

  return data as { theme: Theme };
};

export const themeHandler = async ({
  data: { theme },
}: { data: { theme: Theme } }) => {
  const session = await useSession<{ theme?: Theme }>({
    name: COOKIE_NAME,
    password: COOKIE_PASSWORD,
    cookie: COOKIE_OPTIONS,
  });

  if (theme === null) {
    await session.clear();
  } else {
    await session.update({
      theme,
    });
  }

  return {
    theme,
  };
};

export async function getThemeFromSession() {
  const session = await useSession<{ theme?: Theme }>({
    name: COOKIE_NAME,
    password: COOKIE_PASSWORD,
    cookie: COOKIE_OPTIONS,
  });

  return isTheme(session.data.theme) ? session.data.theme : null;
}
