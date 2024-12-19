import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setMetaThemeColor: (color?: string) => void;
  resetMetaThemeColor: () => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  setMetaThemeColor: () => null,
  resetMetaThemeColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const newTheme = mediaQuery.matches ? 'dark' : 'light';
      handleSystemThemeChange(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Initial setup
    handleChange();

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setMetaThemeColor = useCallback(
    (color?: string) => changeMetaThemeColor({ color }),
    [],
  );

  const resetMetaThemeColor = useCallback(
    () => changeMetaThemeColor({ theme: systemTheme }),
    [systemTheme],
  );

  const handleSystemThemeChange = useCallback(
    (systemTheme: 'light' | 'dark') => {
      setSystemTheme(systemTheme);
      if (theme === 'system') {
        changeHtmlThemeAttributes(systemTheme);
      }
    },
    [theme],
  );

  const changeHtmlThemeAttributes = useCallback((theme: 'light' | 'dark') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    changeMetaThemeColor({ theme });
  }, []);

  const changeTheme = useCallback(
    (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
      if (theme === 'system') {
        changeHtmlThemeAttributes(systemTheme);
      } else {
        changeHtmlThemeAttributes(theme);
      }
    },
    [systemTheme, storageKey, changeHtmlThemeAttributes],
  );

  return (
    <ThemeProviderContext.Provider
      {...props}
      value={{
        theme,
        setTheme: changeTheme,
        setMetaThemeColor,
        resetMetaThemeColor,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

const lightColor = '#fffaff';
const darkColor = '#1d1ba1f';

export const changeMetaThemeColor = ({
  theme,
  color,
}: { theme?: 'light' | 'dark'; color?: string }) => {
  const newColor = color ? color : theme === 'light' ? lightColor : darkColor;

  let meta = document.querySelector(
    "meta[name='theme-color']",
  ) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.getElementsByTagName('head')[0]?.appendChild(meta);
  }
  meta.setAttribute('content', newColor);
};

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
