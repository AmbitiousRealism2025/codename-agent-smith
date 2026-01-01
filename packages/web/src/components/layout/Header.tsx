import { Link } from 'react-router-dom';
import { Settings, Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

export function Header() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-6">
        <Link to="/" className="font-display text-xl font-bold text-foreground">
          Agent Advisor
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link
            to="/settings"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
