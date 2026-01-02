import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProviderStore } from '@/stores/provider-store';
import { ProviderSelector } from '@/components/providers/ProviderSelector';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export function SetupPage() {
  const navigate = useNavigate();
  const { isConfigured } = useProviderStore();

  const handleComplete = () => {
    navigate('/interview');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex items-center justify-center"
      data-testid="setup-page"
    >
      <a
        href="#setup-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to setup form
      </a>
      <ThemeToggle />
      <main id="setup-content" className="container mx-auto px-4 py-8 max-w-3xl" tabIndex={-1}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Agent Advisor</h1>
          <p className="text-muted-foreground">
            Before we begin, select your AI provider and enter your API key.
          </p>
        </div>

        <ProviderSelector onComplete={handleComplete} />

        {isConfigured && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <Button variant="outline" onClick={handleComplete} data-testid="continue-interview-button">
              Continue to Interview
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-6 border-t border-border/50"
        >
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Want to explore first?
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className="text-muted-foreground hover:text-foreground"
              data-testid="skip-setup-button"
            >
              Skip for now
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <p className="text-xs text-muted-foreground/70 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Document generation requires a configured provider
            </p>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
