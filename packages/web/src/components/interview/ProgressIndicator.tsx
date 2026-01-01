import { motion } from 'framer-motion';
import type { InterviewStage } from '@/types/interview';

interface ProgressIndicatorProps {
  percentage: number;
  currentStage: InterviewStage;
  totalAnswered: number;
  totalQuestions: number;
}

const STAGE_LABELS: Record<InterviewStage, string> = {
  discovery: 'Discovery',
  requirements: 'Requirements',
  architecture: 'Architecture',
  output: 'Output',
  complete: 'Complete',
};

export function ProgressIndicator({
  percentage,
  currentStage,
  totalAnswered,
  totalQuestions,
}: ProgressIndicatorProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[120px] h-[120px]">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{percentage}%</span>
          <span className="text-sm text-muted-foreground">complete</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm font-medium">{STAGE_LABELS[currentStage]}</p>
        <p className="text-sm text-muted-foreground">
          {totalAnswered} of {totalQuestions} questions
        </p>
      </div>
    </div>
  );
}
