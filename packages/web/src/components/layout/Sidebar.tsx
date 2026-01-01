import { NavLink } from 'react-router-dom';
import { MessageSquare, LayoutGrid, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/advisor', icon: MessageSquare, label: 'Interview' },
  { to: '/templates', icon: LayoutGrid, label: 'Templates' },
];

export function Sidebar() {
  return (
    <aside 
      className="hidden w-72 shrink-0 border-r border-border bg-card lg:block"
      aria-label="Sidebar navigation"
    >
      <div className="flex h-[calc(100vh-4rem)] flex-col p-4">
        <button 
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Start a new interview session"
        >
          <Plus size={18} aria-hidden="true" />
          New Session
        </button>

        <nav className="space-y-1" aria-label="Main navigation">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="rounded-lg border border-border bg-muted/50 p-3" role="status" aria-live="polite">
            <p className="text-xs text-muted-foreground">
              Sessions will appear here
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
