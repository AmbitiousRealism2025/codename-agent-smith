import { useNavigate } from 'react-router-dom';
import { useAdvisorStore } from '@/stores/advisor-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCcw, FileText } from 'lucide-react';

export function AdvisorPage() {
  const navigate = useNavigate();
  const { sessionId, isComplete, requirements, resetInterview } = useAdvisorStore();

  const hasSession = !!sessionId;
  const hasName = requirements.name;

  const handleNewInterview = () => {
    resetInterview();
    navigate('/setup');
  };

  const handleContinue = () => {
    if (isComplete) {
      navigate('/results');
    } else {
      navigate('/interview');
    }
  };

  if (!hasSession) {
    return (
      <div className="animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Agent Advisor
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create a custom Claude Agent SDK application through a guided interview.
        </p>

        <div className="mt-8 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Answer 15 questions about your use case, and we'll recommend the best
                agent template with a complete planning document.
              </p>
              <Button onClick={handleNewInterview} className="w-full">
                Start Interview
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Agent Advisor
      </h1>
      <p className="mt-2 text-muted-foreground">
        {isComplete
          ? 'Your interview is complete. View your results or start over.'
          : 'You have an interview in progress.'}
      </p>

      <div className="mt-8 grid gap-4 max-w-2xl sm:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleContinue}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">
                {isComplete ? 'View Results' : 'Continue Interview'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {hasName ? `Agent: ${requirements.name}` : 'Resume where you left off'}
            </p>
            <Button variant="outline" size="sm">
              {isComplete ? 'View Results' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleNewInterview}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Start Fresh</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Begin a new interview from scratch
            </p>
            <Button variant="ghost" size="sm">
              New Interview
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
