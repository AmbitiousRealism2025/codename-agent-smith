import { Check } from 'lucide-react';
import type { InterviewStage } from '@/types/interview';

interface StageIndicatorProps {
  currentStage: InterviewStage;
}

const STAGES: { id: InterviewStage; label: string }[] = [
  { id: 'discovery', label: 'Discovery' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'output', label: 'Output' },
];

export function StageIndicator({ currentStage }: StageIndicatorProps) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="flex items-center justify-center gap-2">
      {STAGES.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div key={stage.id} className="flex items-center">
            <div className="flex items-center gap-2">
              {isCompleted && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              {isCurrent && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                </div>
              )}
              {isFuture && (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
              )}
              <span
                className={
                  isCompleted || isCurrent
                    ? 'text-sm font-medium text-foreground'
                    : 'text-sm text-muted-foreground'
                }
              >
                {stage.label}
              </span>
            </div>

            {index < STAGES.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 ${
                  index < currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
