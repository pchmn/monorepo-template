import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from '@monorepo-template/ssr-theme';
import {
  getThemeFromSession,
  themeHandler,
  themeValidator,
} from '@monorepo-template/ssr-theme/tanstart';
import uiCss from '@monorepo-template/ui/style.css?url';
import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
} from '@tanstack/react-router';
import { Meta, Scripts, createServerFn } from '@tanstack/start';
import type { ReactNode } from 'react';

const getTheme = createServerFn({
  method: 'GET',
}).handler(async () => {
  const theme = await getThemeFromSession();
  return { theme };
});

const updateTheme = createServerFn({ method: 'POST' })
  .validator(themeValidator)
  .handler(themeHandler);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [{ rel: 'stylesheet', href: uiCss }],
  }),
  beforeLoad: () => getTheme(),
  component: RootComponent,
});

function RootComponent() {
  const { theme } = Route.useRouteContext();

  return (
    <ThemeProvider specifiedTheme={theme} themeAction={updateTheme}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ThemeProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const [theme] = useTheme();

  return (
    <html lang='en' className={theme ?? ''}>
      <head>
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(theme)} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
