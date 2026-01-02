import { useState, useEffect, useCallback } from 'react';
import { useConvex } from 'convex/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Cloud, Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  detectLocalData,
  migrateToCloud,
  clearLocalSessionsAfterMigration,
  type MigrationProgress,
  type LocalDataInfo,
} from './migration';
import { createConvexAdapter } from './convex-adapter';

interface MigrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type MigrationStep = 'detect' | 'confirm' | 'migrating' | 'success' | 'error';

export function MigrationDialog({ open, onOpenChange }: MigrationDialogProps) {
  const convex = useConvex();
  const [step, setStep] = useState<MigrationStep>('detect');
  const [localData, setLocalData] = useState<LocalDataInfo | null>(null);
  const [progress, setProgress] = useState<MigrationProgress>({
    total: 0,
    completed: 0,
    current: null,
    status: 'idle',
    error: null,
  });
  const [migratedCount, setMigratedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open && step === 'detect') {
      detectLocalData().then((info) => {
        setLocalData(info);
        if (info.sessionCount === 0) {
          setStep('success');
          setMigratedCount(0);
        } else {
          setStep('confirm');
        }
      });
    }
  }, [open, step]);

  const handleMigrate = useCallback(async () => {
    setStep('migrating');
    setErrorMessage(null);

    const cloudAdapter = createConvexAdapter(convex);
    const result = await migrateToCloud(cloudAdapter, setProgress);

    if (result.success) {
      setMigratedCount(result.migratedCount);
      setStep('success');
    } else {
      setErrorMessage(result.errors[0] || 'Migration failed');
      setStep('error');
    }
  }, [convex]);

  const handleClearLocal = useCallback(async () => {
    await clearLocalSessionsAfterMigration();
    onOpenChange(false);
  }, [onOpenChange]);

  const handleClose = useCallback(() => {
    if (step !== 'migrating') {
      onOpenChange(false);
      setStep('detect');
      setProgress({ total: 0, completed: 0, current: null, status: 'idle', error: null });
    }
  }, [step, onOpenChange]);

  const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Cloud Migration
          </DialogTitle>
          <DialogDescription>
            {step === 'detect' && 'Checking for local data...'}
            {step === 'confirm' && 'Migrate your local sessions to the cloud for sync across devices.'}
            {step === 'migrating' && 'Migration in progress...'}
            {step === 'success' && 'Migration complete!'}
            {step === 'error' && 'Migration encountered an error.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'detect' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {step === 'confirm' && localData && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Database className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">{localData.sessionCount} session{localData.sessionCount !== 1 ? 's' : ''} found</p>
                  <p className="text-sm text-muted-foreground">
                    These will be uploaded to your cloud account.
                  </p>
                  {localData.hasApiKeys && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      API keys will remain stored locally for security.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'migrating' && (
            <div className="space-y-4">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Migrating {progress.completed} of {progress.total} sessions...
              </p>
              {progress.current && (
                <p className="text-xs text-center text-muted-foreground/70 font-mono truncate">
                  {progress.current}
                </p>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-center">
                {migratedCount > 0
                  ? `Successfully migrated ${migratedCount} session${migratedCount !== 1 ? 's' : ''} to the cloud.`
                  : 'No sessions to migrate.'}
              </p>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-center text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleMigrate}>
                Start Migration
              </Button>
            </>
          )}

          {step === 'success' && migratedCount > 0 && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Keep Local Backup
              </Button>
              <Button onClick={handleClearLocal}>
                Clear Local Data
              </Button>
            </>
          )}

          {step === 'success' && migratedCount === 0 && (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}

          {step === 'error' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleMigrate}>
                Retry
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
