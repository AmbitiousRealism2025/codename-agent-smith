import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, LayoutGrid, Plus } from 'lucide-react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';
import { SessionList } from '@/components/sessions';
import { useAdvisorStore } from '@/stores/advisor-store';

const navItems = [
  { to: '/advisor', icon: MessageSquare, label: 'Interview' },
  { to: '/templates', icon: LayoutGrid, label: 'Templates' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { resetInterview } = useAdvisorStore();

  const handleNewSession = () => {
    resetInterview();
    navigate('/setup');
  };

  return (
    <aside 
      className="hidden w-72 shrink-0 border-r border-border bg-card lg:block"
      aria-label="Sidebar navigation"
    >
      <div className="flex h-[calc(100vh-4rem)] flex-col p-4">
        <button 
          onClick={handleNewSession}
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

        <div className="mt-4 flex-1 overflow-y-auto">
          <SignedIn>
            <div className="space-y-2">
              <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Sessions
              </h3>
              <SessionList />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="rounded-lg border border-border bg-muted/50 p-3" role="status" aria-live="polite">
              <p className="text-xs text-muted-foreground">
                Sign in to save sessions
              </p>
            </div>
          </SignedOut>
        </div>
      </div>
    </aside>
  );
}
