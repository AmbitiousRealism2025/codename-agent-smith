import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdvisorStore } from '@/stores/advisor-store';
import { QuestionCard } from '@/components/interview/QuestionCard';
import { ProgressIndicator } from '@/components/interview/ProgressIndicator';
import { StageIndicator } from '@/components/interview/StageIndicator';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ResponseValue } from '@/types/interview';

export function InterviewPage() {
  const navigate = useNavigate();
  const {
    sessionId,
    initSession,
    getCurrentQuestion,
    getProgress,
    recordResponse,
    skipQuestion,
    goToPreviousQuestion,
    canGoBack,
    isComplete,
    requirements,
    responses,
  } = useAdvisorStore();

  const [currentValue, setCurrentValue] = useState<ResponseValue | undefined>(undefined);

  const question = getCurrentQuestion();
  const progress = getProgress();

  useEffect(() => {
    if (!sessionId) {
      initSession();
    }
  }, [sessionId, initSession]);

  useEffect(() => {
    if (question) {
      setCurrentValue(responses[question.id]);
    }
  }, [question?.id, responses]);

  const handleSubmit = () => {
    if (question && currentValue !== undefined) {
      recordResponse(question.id, currentValue);
      setCurrentValue(undefined);
    }
  };

  const handleSkip = () => {
    skipQuestion();
    setCurrentValue(undefined);
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background"
      >
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
              <p className="text-muted-foreground mb-6">
                We've collected all the information needed to generate your agent recommendations.
              </p>

              <div className="text-left bg-muted/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Summary</h3>
                <ul className="space-y-1 text-sm">
                  {requirements.name && <li><strong>Agent:</strong> {requirements.name}</li>}
                  {requirements.primaryOutcome && <li><strong>Goal:</strong> {requirements.primaryOutcome}</li>}
                  {requirements.interactionStyle && <li><strong>Style:</strong> {requirements.interactionStyle}</li>}
                  {requirements.capabilities?.memory && (
                    <li><strong>Memory:</strong> {requirements.capabilities.memory}</li>
                  )}
                </ul>
              </div>

              <Button size="lg" onClick={() => navigate('/results')}>
                Generate Recommendations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <a
        href="#interview-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to current question
      </a>
      <ThemeToggle />
      <main id="interview-content" className="container mx-auto px-4 py-8 max-w-6xl" tabIndex={-1}>
        <div className="mb-8">
          <StageIndicator currentStage={progress.currentStage} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            {canGoBack() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousQuestion}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            <QuestionCard
              question={question}
              value={currentValue}
              onChange={setCurrentValue}
              onSubmit={handleSubmit}
              onSkip={!question.required ? handleSkip : undefined}
            />
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card>
              <CardContent className="pt-6">
                <ProgressIndicator
                  percentage={progress.percentage}
                  currentStage={progress.currentStage}
                  totalAnswered={progress.totalAnswered}
                  totalQuestions={progress.totalQuestions}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
