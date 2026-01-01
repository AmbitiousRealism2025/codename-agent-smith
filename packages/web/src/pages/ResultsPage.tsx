import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAdvisorStore } from '@/stores/advisor-store';
import { AgentClassifier } from '@/lib/classification/classifier';
import { getTemplateById, ALL_TEMPLATES } from '@/templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Progress } from '@/components/ui/progress';
import { DocumentExport } from '@/components/export/DocumentExport';
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { AgentRecommendations, AgentRequirements } from '@/types/agent';

export function ResultsPage() {
  const navigate = useNavigate();
  const { requirements, resetInterview } = useAdvisorStore();
  const [recommendations, setRecommendations] = useState<AgentRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);

  useEffect(() => {
    const hasMinimumRequirements =
      requirements.name &&
      requirements.primaryOutcome &&
      requirements.interactionStyle;

    if (!hasMinimumRequirements) {
      navigate('/interview');
      return;
    }

    setIsLoading(true);
    const classifier = new AgentClassifier(ALL_TEMPLATES);

    try {
      const result = classifier.classify(requirements as AgentRequirements);
      setRecommendations(result);
    } catch {
      navigate('/interview');
    } finally {
      setIsLoading(false);
    }
  }, [requirements, navigate]);

  const handleCopyPrompt = async () => {
    if (!recommendations?.systemPrompt) return;
    await navigator.clipboard.writeText(recommendations.systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartOver = () => {
    resetInterview();
    navigate('/interview');
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🔍</span>
          </div>
          <p className="text-muted-foreground">Analyzing requirements...</p>
        </div>
      </motion.div>
    );
  }

  if (!recommendations) {
    return null;
  }

  const template = getTemplateById(recommendations.agentType);
  const classifier = new AgentClassifier(ALL_TEMPLATES);
  const scores = classifier.scoreAllTemplates(requirements as AgentRequirements);
  const primaryScore = scores[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <a
        href="#results-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to results
      </a>
      <ThemeToggle />
      <main id="results-content" className="container mx-auto px-4 py-8 max-w-4xl" tabIndex={-1}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/interview')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Your Agent Recommendations</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{template?.name || recommendations.agentType}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {recommendations.agentType}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Confidence Score</span>
                <span className="text-sm font-medium">{primaryScore?.score.toFixed(0)}%</span>
              </div>
              <Progress value={primaryScore?.score || 0} className="h-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Matched Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {primaryScore?.matchedCapabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      {cap}
                    </span>
                  ))}
                  {primaryScore?.matchedCapabilities.length === 0 && (
                    <span className="text-sm text-muted-foreground">None detected</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Missing Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {primaryScore?.missingCapabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                    >
                      {cap}
                    </span>
                  ))}
                  {primaryScore?.missingCapabilities.length === 0 && (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">{recommendations.notes}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Implementation Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {recommendations.implementationSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <button
              onClick={() => setPromptExpanded(!promptExpanded)}
              className="flex items-center justify-between w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
              aria-expanded={promptExpanded}
              aria-controls="system-prompt-content"
            >
              <CardTitle>System Prompt Preview</CardTitle>
              {promptExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              )}
            </button>
          </CardHeader>
          {promptExpanded && (
            <CardContent id="system-prompt-content">
              <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
                {recommendations.systemPrompt}
              </pre>
            </CardContent>
          )}
        </Card>

        <div className="mt-6">
          <DocumentExport
            templateId={recommendations.agentType}
            agentName={requirements.name || 'My Agent'}
            requirements={requirements as AgentRequirements}
            recommendations={recommendations}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button variant="secondary" onClick={handleCopyPrompt} className="flex-1">
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy System Prompt
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleStartOver}>
            Start Over
          </Button>
        </div>
      </main>
    </motion.div>
  );
}
