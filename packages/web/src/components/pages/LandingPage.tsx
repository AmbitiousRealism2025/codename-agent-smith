import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <ThemeToggle />
      <div className="text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles size={14} className="text-accent" />
          Build Claude Agent SDK Apps
        </div>

        <h1 className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Agent Advisor
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
          A guided interview that helps you create custom Claude Agent SDK
          applications. Answer questions, get a tailored implementation plan.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/setup"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
          >
            Browse Templates
          </Link>
        </div>
      </div>
    </div>
  );
}
