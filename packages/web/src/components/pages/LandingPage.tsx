import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4" data-testid="landing-page">
      <a
        href="#main-actions"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main actions
      </a>
      <ThemeToggle className="left-4 right-auto" />
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline" size="sm" className="bg-card">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">
              Sign Up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link
            to="/advisor"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Dashboard
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-8 w-8',
                userButtonPopoverCard: 'bg-card border border-border shadow-lg',
                userButtonPopoverActionButton: 'hover:bg-muted',
                userButtonPopoverActionButtonText: 'text-foreground',
                userButtonPopoverFooter: 'hidden',
              },
            }}
            afterSignOutUrl="/"
          />
        </SignedIn>
      </div>
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