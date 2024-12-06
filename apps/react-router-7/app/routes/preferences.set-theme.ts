import { createThemeAction } from 'remix-themes';
import { themeSessionResolver } from '~/lib/theme/session.server';

export const action = createThemeAction(themeSessionResolver);
