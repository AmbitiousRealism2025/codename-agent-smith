import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Key, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useProviderStore } from '@/stores/provider-store';
import { getAllProviders } from '@/lib/providers';
import { getApiKey, deleteApiKey } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProviderId, ProviderAdapter } from '@/lib/providers';

interface ProviderKeyStatus {
  provider: ProviderAdapter;
  hasSavedKey: boolean;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { selectedProvider, selectedModel } = useProviderStore();
  const [providerKeyStatuses, setProviderKeyStatuses] = useState<ProviderKeyStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentProvider = getAllProviders().find((p) => p.id === selectedProvider);

  useEffect(() => {
    async function loadKeyStatuses() {
      setIsLoading(true);
      const providers = getAllProviders();
      const statuses = await Promise.all(
        providers.map(async (provider) => {
          const key = await getApiKey(provider.id as ProviderId);
          return {
            provider,
            hasSavedKey: !!key,
          };
        })
      );
      setProviderKeyStatuses(statuses);
      setIsLoading(false);
    }
    loadKeyStatuses();
  }, []);

  const handleRemoveKey = async (providerId: ProviderId) => {
    await deleteApiKey(providerId);
    setProviderKeyStatuses((prev) =>
      prev.map((status) =>
        status.provider.id === providerId ? { ...status, hasSavedKey: false } : status
      )
    );
  };

  const handleClearAllKeys = async () => {
    const providers = getAllProviders();
    await Promise.all(providers.map((p) => deleteApiKey(p.id as ProviderId)));
    setProviderKeyStatuses((prev) =>
      prev.map((status) => ({ ...status, hasSavedKey: false }))
    );
  };

  const hasAnySavedKeys = providerKeyStatuses.some((status) => status.hasSavedKey);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Configure API providers and preferences.
      </p>

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Currently:{' '}
                <span className="font-medium text-foreground">
                  {currentProvider?.name ?? selectedProvider}
                </span>{' '}
                /{' '}
                <span className="font-mono text-foreground">{selectedModel}</span>
              </div>
              <Button variant="outline" onClick={() => navigate('/setup')}>
                Change Provider
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-4">
                <ul className="space-y-3">
                  {providerKeyStatuses.map(({ provider, hasSavedKey }) => (
                    <li
                      key={provider.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{provider.name}</span>
                        {hasSavedKey ? (
                          <span className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Saved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <XCircle className="h-4 w-4" />
                            Not set
                          </span>
                        )}
                      </div>
                      {hasSavedKey && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveKey(provider.id as ProviderId)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="destructive"
                  onClick={handleClearAllKeys}
                  disabled={!hasAnySavedKeys}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Keys
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-mono">1.0.0-alpha</span>
              </div>
              <div>
                <a href="#" className="text-primary underline-offset-4 hover:underline">
                  Documentation
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
