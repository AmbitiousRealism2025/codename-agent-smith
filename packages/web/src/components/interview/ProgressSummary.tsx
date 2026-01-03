import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { INTERVIEW_QUESTIONS } from '@/lib/interview/questions';
import type { ResponseValue, InterviewStage } from '@/types/interview';

interface ProgressSummaryProps {
  responses: Record<string, ResponseValue>;
  onQuestionClick: (questionId: string) => void;
  currentQuestionId?: string;
}

const STAGE_LABELS: Record<InterviewStage, string> = {
  discovery: 'Discovery',
  requirements: 'Requirements',
  architecture: 'Architecture',
  output: 'Output',
  complete: 'Complete',
};

// Simple archetype heuristics based on answered questions
function getEmergingArchetype(responses: Record<string, ResponseValue>): {
  name: string;
  confidence: number;
} | null {
  const answeredCount = Object.keys(responses).length;
  if (answeredCount < 3) return null;

  const dataAnalysis = responses['q11_data_analysis'] === true;
  const codeExecution = responses['q10_code_execution'] === true;
  const webAccess = responses['q9_web_access'] === true;
  const fileAccess = responses['q8_file_access'] === true;
  const primaryOutcome = (responses['q2_primary_outcome'] as string)?.toLowerCase() ?? '';

  // Simple scoring based on capabilities and primary outcome
  let archetype = 'Automation Agent';
  let confidence = 30 + Math.min(answeredCount * 5, 40);

  if (dataAnalysis) {
    archetype = 'Data Analyst';
    confidence = Math.min(confidence + 15, 95);
  } else if (codeExecution) {
    archetype = 'Code Assistant';
    confidence = Math.min(confidence + 15, 95);
  } else if (webAccess && primaryOutcome.includes('research')) {
    archetype = 'Research Agent';
    confidence = Math.min(confidence + 15, 95);
  } else if (fileAccess && (primaryOutcome.includes('content') || primaryOutcome.includes('blog'))) {
    archetype = 'Content Creator';
    confidence = Math.min(confidence + 15, 95);
  }

  return { name: archetype, confidence };
}

// Format response value for display
function formatResponse(value: ResponseValue, maxLength = 50): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (Array.isArray(value)) {
    const joined = value.join(', ');
    return joined.length > maxLength ? `${joined.slice(0, maxLength)}...` : joined;
  }
  if (typeof value === 'string') {
    return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
  }
  return String(value);
}

export function ProgressSummary({
  responses,
  onQuestionClick,
  currentQuestionId,
}: ProgressSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const answeredQuestions = INTERVIEW_QUESTIONS.filter((q) => q.id in responses);
  const emergingArchetype = getEmergingArchetype(responses);

  // Group answered questions by stage
  const questionsByStage = answeredQuestions.reduce(
    (acc, question) => {
      const stage = question.stage;
      if (!acc[stage]) {
        acc[stage] = [];
      }
      acc[stage].push(question);
      return acc;
    },
    {} as Record<InterviewStage, typeof answeredQuestions>
  );

  const stages = Object.keys(questionsByStage) as InterviewStage[];

  const renderQuestionsList = () => {
    if (answeredQuestions.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-4" data-testid="empty-state">
          No questions answered yet
        </p>
      );
    }

    return (
      <ul className="space-y-4" data-testid="answered-questions-list">
        {stages.map((stage) => (
          <li key={stage}>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {STAGE_LABELS[stage]}
            </h4>
            <ul className="space-y-1">
              {questionsByStage[stage].map((question, index) => {
                const isCurrent = question.id === currentQuestionId;
                const response = responses[question.id];

                // Skip if no response (shouldn't happen as we filter, but satisfies TypeScript)
                if (response === undefined) return null;

                return (
                  <motion.li
                    key={question.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => onQuestionClick(question.id)}
                      className={cn(
                        'w-full text-left p-2 rounded-md transition-colors',
                        'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        isCurrent && 'bg-primary/10 border border-primary/20'
                      )}
                      data-testid={`answered-question-${question.id}`}
                      aria-current={isCurrent ? 'true' : undefined}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {question.text}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatResponse(response)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    );
  };

  const renderArchetypeIndicator = () => {
    if (!emergingArchetype) return null;

    return (
      <div
        className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 mb-4"
        data-testid="archetype-indicator"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Emerging: {emergingArchetype.name}</p>
          <p className="text-xs text-muted-foreground">
            {emergingArchetype.confidence}% confidence
          </p>
        </div>
      </div>
    );
  };

  // Mobile view: collapsible card
  const mobileView = (
    <div className="lg:hidden" data-testid="progress-summary-mobile">
      <Card>
        <CardHeader className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="progress-summary-content-mobile"
          >
            <CardTitle className="text-base">
              Your Progress ({answeredQuestions.length} answered)
            </CardTitle>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        </CardHeader>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              id="progress-summary-content-mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0 pb-4">
                {renderArchetypeIndicator()}
                <div className="max-h-[300px] overflow-y-auto">
                  {renderQuestionsList()}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );

  // Desktop view: always visible sidebar
  const desktopView = (
    <div className="hidden lg:block" data-testid="progress-summary-desktop">
      <Card data-testid="progress-summary">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {renderArchetypeIndicator()}
          <div className="max-h-[400px] overflow-y-auto pr-1">
            {renderQuestionsList()}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
}
