import '@monorepo-template/ui/style.css';

import { ThemeProvider } from '@monorepo-template/ui/theme-provider.client';
import { StartClient } from '@tanstack/start';
import { hydrateRoot } from 'react-dom/client';
import { createRouter } from './router';

const router = createRouter();

hydrateRoot(
  document,
  <ThemeProvider>
    <StartClient router={router} />
  </ThemeProvider>,
);
