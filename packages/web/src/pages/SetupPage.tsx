import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProviderStore } from '@/stores/provider-store';
import { ProviderSelector } from '@/components/providers/ProviderSelector';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
    >
      <div className="container mx-auto px-4 py-8 max-w-3xl">
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
            <Button variant="outline" onClick={handleComplete}>
              Continue to Interview
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
