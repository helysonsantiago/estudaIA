'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Key, 
  Brain, 
  Bot, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Save,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { 
  getApiConfig, 
  saveApiConfig, 
  clearApiConfig, 
  testApiConnection,
  hasAnyApiConfigured,
  getActiveProvider,
  ApiConfig,
  TestResult 
} from '@/lib/apiConfig';

interface ApiProvider {
  id: keyof ApiConfig;
  name: string;
  icon: React.ReactNode;
  description: string;
  placeholder: string;
  models: string[];
}

const API_PROVIDERS: ApiProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: <Brain className="h-5 w-5" />,
    description: 'GPT-4, GPT-3.5 Turbo e outros modelos da OpenAI',
    placeholder: 'sk-...',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: <Bot className="h-5 w-5" />,
    description: 'Claude 3 e modelos da Anthropic',
    placeholder: 'sk-ant-...',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307']
  },
  {
    id: 'google',
    name: 'Google Gemini',
    icon: <Key className="h-5 w-5" />,
    description: 'Gemini Flash (recomendado)',
    placeholder: 'AIza...',
    models: ['gemini-flash-latest']
  },
  {
    id: 'grok',
    name: 'Grok (xAI)',
    icon: <Bot className="h-5 w-5" />,
    description: 'Grok e modelos da xAI',
    placeholder: 'grok-...',
    models: ['grok-beta']
  }
];

interface ApiSettingsProps {
  onSettingsSaved?: () => void;
}

export function ApiSettings({ onSettingsSaved }: ApiSettingsProps) {
  const [config, setConfig] = useState<ApiConfig>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setConfig(getApiConfig());
  }, []);

  const handleApiKeyChange = (provider: keyof ApiConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        apiKey: value
      }
    }));
    setHasChanges(true);
    // Clear test result when key changes
    setTestResults(prev => {
      const next = { ...prev };
      delete next[provider];
      return next;
    });
  };

  const handleModelChange = (provider: keyof ApiConfig, model: string) => {
    setConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        model
      }
    }));
    setHasChanges(true);
  };

  const testConnection = async (provider: keyof ApiConfig) => {
    setTesting(prev => ({ ...prev, [provider]: true }));
    try {
      const result = await testApiConnection(provider);
      setTestResults(prev => ({ ...prev, [provider]: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [provider]: { ok: false, message: (error as Error).message } }));
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      saveApiConfig(config);
      setHasChanges(false);
      // Test all configured providers
      const promises = Object.keys(config).map(async (provider) => {
        if (config[provider as keyof ApiConfig]?.apiKey) {
          await testConnection(provider as keyof ApiConfig);
        }
      });
      await Promise.all(promises);
      onSettingsSaved?.();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    if (confirm('Tem certeza que deseja limpar todas as configurações de API?')) {
      clearApiConfig();
      setConfig({});
      setTestResults({});
      setHasChanges(false);
    }
  };

  const activeProvider = getActiveProvider();
  const hasAnyApi = hasAnyApiConfigured();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Configurações de API</h2>
            <p className="text-muted-foreground">Configure suas chaves de API para ativar a IA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasAnyApi && (
            <Badge variant="outline" className="border-green-500 text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              IA Ativada
            </Badge>
          )}
          {!hasAnyApi && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
              <RefreshCw className="h-3 w-3 mr-1" />
              Modo Demo
            </Badge>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {activeProvider && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Provedor ativo: <strong>{API_PROVIDERS.find(p => p.id === activeProvider)?.name}</strong>
          </AlertDescription>
        </Alert>
      )}

      {!hasAnyApi && (
        <Alert className="border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            O sistema está funcionando em modo demonstração. Configure uma API abaixo para ativar a IA real.
          </AlertDescription>
        </Alert>
      )}

      {/* API Providers */}
      <div className="grid gap-6">
        {API_PROVIDERS.map((provider) => {
          const providerConfig = config[provider.id];
          const isTesting = testing[provider.id];
          const testResult = testResults[provider.id];
          const hasKey = !!providerConfig?.apiKey;

          return (
            <Card key={provider.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {provider.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription>{provider.description}</CardDescription>
                    </div>
                  </div>
                  {testResult !== undefined && (
                    <Badge variant={testResult.ok ? "success" : "destructive"}>
                      {testResult.ok ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      {testResult.ok ? 'Conectado' : `Falha${testResult.status ? ` (${testResult.status})` : ''}`}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${provider.id}-key`}>Chave de API</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`${provider.id}-key`}
                      type="password"
                      placeholder={provider.placeholder}
                      value={providerConfig?.apiKey || ''}
                      onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                      className="font-mono"
                    />
                    {hasKey && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => testConnection(provider.id)}
                        disabled={isTesting}
                      >
                        {isTesting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {!isTesting && testResult && !testResult.ok && (
                  <Alert className="border-destructive/30 bg-destructive/5">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription>
                      {testResult.message || 'Falha ao conectar. Verifique a chave e permissões.'}
                    </AlertDescription>
                  </Alert>
                )}

                {hasKey && provider.models.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor={`${provider.id}-model`}>Modelo</Label>
                    <select
                      id={`${provider.id}-model`}
                      value={providerConfig?.model || provider.models[0]}
                      onChange={(e) => handleModelChange(provider.id, e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {provider.models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <strong>Como obter:</strong> Acesse o site oficial de {provider.name} e crie uma conta para obter sua chave de API.
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleClearAll} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar Tudo
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}