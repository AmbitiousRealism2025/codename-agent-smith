import { useState } from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { Cloud, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface SaveToCloudButtonProps {
  onSave: () => Promise<void>;
  disabled?: boolean;
}

export function SaveToCloudButton({ onSave, disabled }: SaveToCloudButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleClick = async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setShowSignInPrompt(true);
      return;
    }

    await performSave();
  };

  const performSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <Button disabled className="flex-1">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled || isSaving}
        className="flex-1"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Saved to Cloud
          </>
        ) : (
          <>
            <Cloud className="w-4 h-4 mr-2" />
            Save to Cloud
          </>
        )}
      </Button>

      <Dialog open={showSignInPrompt} onOpenChange={setShowSignInPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to Save</DialogTitle>
            <DialogDescription>
              Create an account or sign in to save your results to the cloud and access them from any device.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <SignInButton mode="modal" fallbackRedirectUrl={window.location.pathname}>
              <Button className="w-full" onClick={() => setShowSignInPrompt(false)}>
                Sign In
              </Button>
            </SignInButton>
            <Button
              variant="ghost"
              onClick={() => setShowSignInPrompt(false)}
            >
              Continue without saving
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
