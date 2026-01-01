import { useState, useEffect } from 'react';
import { useProviderStore } from '@/stores/provider-store';
import { getAllProviders, validateProviderApiKey } from '@/lib/providers';
import type { ProviderId, ProviderAdapter } from '@/lib/providers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle, X } from 'lucide-react';
import { saveApiKey, getApiKey, deleteApiKey, encryptApiKey } from '@/lib/storage';

interface ProviderSelectorProps {
  onComplete?: () => void;
}

export function ProviderSelector({ onComplete }: ProviderSelectorProps) {
  const { selectedProvider, setProvider, setConfigured } = useProviderStore();
  const [apiKey, setApiKey] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const providers = getAllProviders();

  useEffect(() => {
    const loadExistingKey = async () => {
      const stored = await getApiKey(selectedProvider);
      if (stored) {
        setHasStoredKey(true);
      } else {
        setHasStoredKey(false);
      }
    };
    loadExistingKey();
  }, [selectedProvider]);

  const handleProviderSelect = async (providerId: ProviderId) => {
    setProvider(providerId);
    setApiKey('');
    setValidationErrors([]);
    setIsValidated(false);
    const stored = await getApiKey(providerId);
    setHasStoredKey(!!stored);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setValidationErrors([]);
    setIsValidated(false);
  };

  const handleSaveAndContinue = async () => {
    const result = validateProviderApiKey(selectedProvider, apiKey);
    
    if (!result.valid) {
      setValidationErrors(result.errors);
      setIsValidated(false);
      return;
    }

    setIsLoading(true);
    try {
      const passphrase = 'agent-advisor-mvp-key';
      const encrypted = await encryptApiKey(apiKey, passphrase);
      await saveApiKey(selectedProvider, encrypted);
      setHasStoredKey(true);
      setIsValidated(true);
      setValidationErrors([]);
      setConfigured(true);
      onComplete?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearKey = async () => {
    setIsLoading(true);
    try {
      await deleteApiKey(selectedProvider);
      setHasStoredKey(false);
      setApiKey('');
      setIsValidated(false);
      setConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthLabel = (auth: ProviderAdapter['authentication']) => {
    switch (auth) {
      case 'apiKey':
        return 'API Key';
      case 'bearer':
        return 'Bearer Token';
      case 'jwt':
        return 'JWT Token';
      default:
        return auth;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <Card
            key={provider.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedProvider === provider.id
                ? 'ring-2 ring-primary'
                : 'hover:border-muted-foreground/50'
            }`}
            onClick={() => handleProviderSelect(provider.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{provider.name}</CardTitle>
                {selectedProvider === provider.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardDescription className="text-sm">
                {provider.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Auth: {getAuthLabel(provider.authentication)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="apiKey">
              {getAuthLabel(providers.find((p) => p.id === selectedProvider)?.authentication || 'apiKey')}
            </Label>
            {hasStoredKey && (
              <span className="text-xs text-green-600 font-medium">Key saved</span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type="password"
              placeholder={hasStoredKey ? 'Enter new key to replace...' : 'Enter your API key...'}
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="flex-1"
            />
            {hasStoredKey && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleClearKey}
                disabled={isLoading}
                title="Clear saved key"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              {validationErrors.map((error, idx) => (
                <p key={idx}>{error}</p>
              ))}
            </div>
          </div>
        )}

        {isValidated && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>API key validated</span>
          </div>
        )}

        <Button
          onClick={handleSaveAndContinue}
          disabled={!apiKey.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
