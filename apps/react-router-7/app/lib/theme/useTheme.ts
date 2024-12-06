import {
  type Theme,
  type ThemeMetadata,
  useTheme as useRemixTheme,
} from 'remix-themes';

export function useTheme() {
  const [remixTheme, setRemixTheme, metadata] = useRemixTheme();

  const setTheme = (theme: 'system' | 'light' | 'dark') => {
    setRemixTheme(theme === 'system' ? null : (theme as Theme));
  };

  return [getColorScheme(remixTheme, metadata), setTheme, metadata] as const;
}

function getColorScheme(theme: Theme | null, metadata: ThemeMetadata) {
  if (metadata.definedBy === 'SYSTEM') {
    return 'system';
  }
  return theme as 'light' | 'dark';
}
