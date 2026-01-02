import { useState } from 'react';
import { useMutation } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Link, Check, Loader2, ChevronDown } from 'lucide-react';

interface ShareButtonProps {
  sessionId: string;
  agentName: string;
  templateId: string;
  documentContent: string;
  disabled?: boolean;
}

type ExpirationOption = 'never' | '1' | '7' | '30';

const EXPIRATION_OPTIONS: { value: ExpirationOption; label: string }[] = [
  { value: 'never', label: 'Never expires' },
  { value: '1', label: '1 day' },
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
];

export function ShareButton({
  sessionId,
  agentName,
  templateId,
  documentContent,
  disabled = false,
}: ShareButtonProps) {
  const { isSignedIn } = useAuth();
  const createShare = useMutation(api.shares.create);

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiration, setExpiration] = useState<ExpirationOption>('never');
  const [error, setError] = useState<string | null>(null);

  const handleCreateShare = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const expirationDays = expiration === 'never' ? undefined : parseInt(expiration, 10);
      const result = await createShare({
        sessionId,
        agentName,
        templateId,
        documentContent,
        expirationDays,
      });

      const url = `${window.location.origin}/share/${result.shareCode}`;
      setShareUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setShareUrl(null);
      setCopied(false);
      setError(null);
      setExpiration('never');
    }
  };

  const selectedLabel = EXPIRATION_OPTIONS.find((o) => o.value === expiration)?.label;

  if (!isSignedIn) {
    return (
      <Button variant="outline" disabled title="Sign in to share">
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Planning Document</DialogTitle>
          <DialogDescription>
            Create a public link to share this document with others. They won't need an account to view it.
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Link expiration</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedLabel}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup value={expiration} onValueChange={(v) => setExpiration(v as ExpirationOption)}>
                    {EXPIRATION_OPTIONS.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button onClick={handleCreateShare} disabled={isCreating} className="w-full">
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating link...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Create share link
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border border-input"
              />
              <Button onClick={handleCopyLink} variant="secondary">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  'Copy'
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view the document.
              {expiration !== 'never' && ` Link expires in ${expiration} day${expiration === '1' ? '' : 's'}.`}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
