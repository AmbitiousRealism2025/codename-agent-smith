import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdvisorStore } from '@/stores/advisor-store';
import { AgentClassifier } from '@/lib/classification/classifier';
import { ALL_TEMPLATES, getTemplateById } from '@/templates';
import { ClipboardList, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProgressSummary() {
  const [isOpen, setIsOpen] = useState(false);
  const answeredQuestions = useAdvisorStore((state) => state.getAnsweredQuestions());
  const navigateToQuestion = useAdvisorStore((state) => state.navigateToQuestion);
  const currentQuestion = useAdvisorStore((state) => state.getCurrentQuestion());
  const requirements = useAdvisorStore((state) => state.requirements);

  // Calculate partial archetype classification
  const classifier = new AgentClassifier(ALL_TEMPLATES);
  const partialResult = classifier.getPartialArchetype(requirements);
  const archetype = partialResult?.archetype ?? 'unknown';
  const confidence = partialResult?.confidence ?? 0;

  // Shared content component for both mobile and desktop
  const SummaryContent = () => {
    // Empty state: no answers yet
    if (answeredQuestions.length === 0) {
      return (
        <Card className="border-border/50" data-testid="progress-summary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList size={20} aria-hidden="true" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 rounded-full bg-muted p-3">
                <ClipboardList size={24} className="text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground">
                Start answering questions to see your progress here
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-border/50" data-testid="progress-summary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList size={20} aria-hidden="true" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {answeredQuestions.length} question{answeredQuestions.length !== 1 ? 's' : ''} answered
          </p>

          {/* Archetype Indicator */}
          {archetype !== 'unknown' && confidence > 0 && (
            <div
              className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3"
              data-testid="archetype-indicator"
            >
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Emerging Archetype
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {getTemplateById(archetype)?.name || archetype}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(confidence * 100)}% confidence
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2" data-testid="answered-questions-list">
            {answeredQuestions.map((question) => {
              const isCurrentQuestion = currentQuestion?.id === question.id;
              return (
                <Button
                  key={question.id}
                  variant={isCurrentQuestion ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left h-auto py-3 px-3"
                  onClick={() => navigateToQuestion(question.id)}
                  data-testid={`answered-question-${question.id}`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <CheckCircle2
                      size={16}
                      className="text-primary mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm flex-1 line-clamp-2">{question.text}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {/* Mobile: Collapsible with toggle (<1024px) */}
      <div className="mb-4 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-expanded={isOpen}
          aria-controls="progress-summary-mobile"
          aria-label="Toggle progress summary"
          data-testid="progress-summary-toggle"
        >
          <span className="flex items-center gap-2">
            <ClipboardList size={18} aria-hidden="true" />
            Your Progress ({answeredQuestions.length})
          </span>
          {isOpen ? (
            <ChevronUp size={18} aria-hidden="true" />
          ) : (
            <ChevronDown size={18} aria-hidden="true" />
          )}
        </button>
        <div
          id="progress-summary-mobile"
          className={cn(
            'mt-2 transition-all duration-200',
            isOpen ? 'block' : 'hidden'
          )}
        >
          <SummaryContent />
        </div>
      </div>

      {/* Desktop: Side panel (≥1024px) */}
      <aside
        className="hidden w-80 shrink-0 lg:block"
        aria-label="Interview progress summary"
      >
        <SummaryContent />
      </aside>
    </>
  );
}
