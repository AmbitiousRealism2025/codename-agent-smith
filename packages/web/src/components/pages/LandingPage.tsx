import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4" data-testid="landing-page">
      <a
        href="#main-actions"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main actions
      </a>
      <ThemeToggle />
      <main className="text-center" role="main">
        <img
          src="/images/Agent-Smith-Logo-test.png"
          alt="Agent Smith - smithing custom agent plans and templates"
          className="mb-10 w-full max-w-xl"
        />

        <div id="main-actions" className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center" tabIndex={-1}>
          <Link
            to="/setup"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            data-testid="get-started-button"
          >
            Get Started
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            data-testid="browse-templates-button"
          >
            Browse Templates
          </Link>
        </div>
      </main>
    </div>
  );
}