import { type ActionFunction, createCookieSessionStorage } from 'react-router';
import { type Theme, isTheme } from '../theme-provider';

type ThemeSession = {
  getTheme: () => Theme | null;
  setTheme: (theme: Theme) => void;
  commit: () => Promise<string>;
  destroy: () => Promise<string>;
};

export type ThemeSessionResolver = (request: Request) => Promise<ThemeSession>;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__rr7-theme',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
});

export const createThemeAction: ActionFunction = async ({ request }) => {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const { theme } = await request.json();

  if (!theme) {
    return Response.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': await sessionStorage.destroySession(session),
        },
      },
    );
  }

  if (!isTheme(theme)) {
    return Response.json(
      {
        success: false,
        message: `theme value of ${theme} is not a valid theme.`,
      },
      {
        headers: { 'Set-Cookie': await sessionStorage.destroySession(session) },
      },
    );
  }

  session.set('theme', theme);
  return Response.json(
    { success: true },
    {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    },
  );
};

export async function getThemeFromSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const theme = session.get('theme');
  return isTheme(theme) ? theme : null;
}
