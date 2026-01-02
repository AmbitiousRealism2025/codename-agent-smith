import { useEffect, useCallback } from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check, RotateCw, WifiOff } from 'lucide-react';
import { useSyncStore, type SyncStatus } from '@/stores/sync-store';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getAdapterType } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SyncIndicatorProps {
  className?: string;
  showLabel?: boolean;
  showRefreshButton?: boolean;
}

const statusConfig: Record<SyncStatus, { icon: typeof Cloud; label: string; className: string }> = {
  idle: {
    icon: Cloud,
    label: 'Ready',
    className: 'text-muted-foreground',
  },
  syncing: {
    icon: RefreshCw,
    label: 'Syncing...',
    className: 'text-primary animate-spin',
  },
  synced: {
    icon: Check,
    label: 'Synced',
    className: 'text-green-600 dark:text-green-400',
  },
  offline: {
    icon: CloudOff,
    label: 'Offline',
    className: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    icon: AlertCircle,
    label: 'Sync Error',
    className: 'text-red-600 dark:text-red-400',
  },
};

export function SyncIndicator({
  className,
  showLabel = false,
  showRefreshButton = true,
}: SyncIndicatorProps) {
  const { status, adapterType, lastSyncedAt, error, isOnline, setNetworkStatus, setSyncing, setSynced } = useSyncStore();
  const networkStatus = useNetworkStatus();
  const currentAdapterType = getAdapterType();

  useEffect(() => {
    setNetworkStatus(networkStatus.isOnline);
  }, [networkStatus.isOnline, setNetworkStatus]);

  const handleManualSync = useCallback(() => {
    if (!isOnline) return;
    setSyncing();
    setTimeout(() => {
      setSynced();
    }, 500);
  }, [isOnline, setSyncing, setSynced]);

  if (currentAdapterType === 'dexie' && adapterType === 'dexie') {
    return null;
  }

  const config = statusConfig[status];
  const Icon = config.icon;

  const formatLastSynced = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const tooltipContent = error
    ? `Sync Error: ${error}`
    : !isOnline
      ? 'Offline - changes will sync when connected'
      : lastSyncedAt
        ? `Last synced: ${formatLastSynced(lastSyncedAt)}`
        : config.label;

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="status"
      aria-label={`Sync status: ${config.label}`}
    >
      <div
        className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted/50 cursor-default"
        title={tooltipContent}
      >
        {!isOnline && (
          <WifiOff size={14} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
        )}
        <Icon size={16} className={config.className} aria-hidden="true" />
        {showLabel && (
          <span className={cn('text-xs', config.className)}>{config.label}</span>
        )}
      </div>

      {showRefreshButton && isOnline && status !== 'syncing' && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleManualSync}
          aria-label="Refresh sync status"
          title="Refresh sync"
        >
          <RotateCw size={14} className="text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
