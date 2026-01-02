import { useMutation, useQuery } from 'convex/react';
import { Palette, Server, Check } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';
import { useUIStore } from '@/stores/ui-store';
import { useProviderStore } from '@/stores/provider-store';
import { getAllProviders } from '@/lib/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProviderId } from '@/lib/providers/types';

type Theme = 'light' | 'dark' | 'system';

const themes: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function UserPreferences() {
  const preferences = useQuery(api.users.getPreferences);
  const updatePreferences = useMutation(api.users.updatePreferences);
  const { theme: localTheme, setTheme: setLocalTheme } = useUIStore();
  const { selectedProvider, setProvider } = useProviderStore();
  const providers = getAllProviders();

  const currentTheme = preferences?.theme ?? localTheme;
  const currentProvider = preferences?.defaultProvider ?? selectedProvider;

  const handleThemeChange = async (theme: Theme) => {
    setLocalTheme(theme);
    await updatePreferences({ theme }).catch(() => {});
  };

  const handleProviderChange = async (providerId: string) => {
    setProvider(providerId as ProviderId);
    await updatePreferences({ defaultProvider: providerId }).catch(() => {});
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {themes.map((t) => (
              <Button
                key={t.value}
                variant={currentTheme === t.value ? 'default' : 'outline'}
                onClick={() => handleThemeChange(t.value)}
                className="relative"
              >
                {currentTheme === t.value && (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {t.label}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Your theme preference syncs across all your devices.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Default Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleProviderChange(provider.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                  'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  currentProvider === provider.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
              >
                <div className="flex-1">
                  <p className="font-medium">{provider.name}</p>
                </div>
                {currentProvider === provider.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            This provider will be pre-selected when starting new sessions.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
