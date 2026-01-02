import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdvisorStore } from '@/stores/advisor-store';
import { ClipboardList, CheckCircle2 } from 'lucide-react';

export function ProgressSummary() {
  const answeredQuestions = useAdvisorStore((state) => state.getAnsweredQuestions());
  const navigateToQuestion = useAdvisorStore((state) => state.navigateToQuestion);
  const currentQuestion = useAdvisorStore((state) => state.getCurrentQuestion());

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
}
