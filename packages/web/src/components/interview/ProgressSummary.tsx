import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdvisorStore } from '@/stores/advisor-store';
import { ClipboardList } from 'lucide-react';

export function ProgressSummary() {
  const answeredQuestions = useAdvisorStore((state) => state.getAnsweredQuestions());

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

  // TODO: Answered questions list will be added in subtask-2-2
  return (
    <Card className="border-border/50" data-testid="progress-summary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList size={20} aria-hidden="true" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {answeredQuestions.length} question{answeredQuestions.length !== 1 ? 's' : ''} answered
        </p>
      </CardContent>
    </Card>
  );
}
