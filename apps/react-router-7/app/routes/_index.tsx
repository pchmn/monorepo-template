import { useTheme } from '@monorepo-template/ssr-theme';
import { Button } from '@monorepo-template/ui/button';
import type { Route } from './+types/_index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Home() {
  const [theme, setTheme] = useTheme();

  return (
    <div>
      <Button
        onClick={() => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
        }}
      >
        Click me
      </Button>
    </div>
  );
}
