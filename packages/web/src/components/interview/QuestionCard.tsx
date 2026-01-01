import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { InterviewQuestion, ResponseValue } from '@/types/interview';

interface QuestionCardProps {
  question: InterviewQuestion;
  value: ResponseValue | undefined;
  onChange: (value: ResponseValue) => void;
  onSubmit: () => void;
  onSkip?: () => void;
}

export function QuestionCard({ question, value, onChange, onSubmit, onSkip }: QuestionCardProps) {
  const isValueEmpty = () => {
    if (value === undefined || value === null) return true;
    if (question.type === 'boolean') return false;
    if (question.type === 'text') return (value as string).trim() === '';
    if (question.type === 'multiselect') return (value as string[]).length === 0;
    if (question.type === 'choice') return value === '';
    return !value;
  };
  
  const isDisabled = question.required && isValueEmpty();

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <Textarea
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.hint}
            className="min-h-[120px] resize-none"
          />
        );

      case 'choice':
        return (
          <RadioGroup
            value={(value as string) ?? ''}
            onValueChange={(v) => onChange(v)}
            className="space-y-3"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiselect': {
        const selected = (value as string[]) ?? [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={selected.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selected, option]);
                    } else {
                      onChange(selected.filter((s) => s !== option));
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      }

      case 'boolean':
        return (
          <RadioGroup
            value={value === true ? 'yes' : value === false ? 'no' : ''}
            onValueChange={(v) => onChange(v === 'yes')}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`} className="cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`} className="cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-2">{question.text}</h2>
            {question.hint && (
              <p className="text-muted-foreground mb-6">{question.hint}</p>
            )}

            <div className="mb-8">{renderInput()}</div>

            <div className="flex justify-between">
              {onSkip && !question.required ? (
                <Button variant="ghost" onClick={onSkip}>
                  Skip
                </Button>
              ) : (
                <div />
              )}
              <Button onClick={onSubmit} disabled={isDisabled}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
