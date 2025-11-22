export interface ApiConfig {
  openai?: {
    apiKey: string;
    model?: string;
  };
  anthropic?: {
    apiKey: string;
    model?: string;
  };
  google?: {
    apiKey: string;
    model?: string;
  };
  grok?: {
    apiKey: string;
    model?: string;
  };
}

const CONFIG_KEY = 'estudaia_api_config';

export function getApiConfig(): ApiConfig {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Erro ao carregar configurações de API:', error);
    return {};
  }
}

export function saveApiConfig(config: ApiConfig): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Erro ao salvar configurações de API:', error);
  }
}

export function clearApiConfig(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch (error) {
    console.error('Erro ao limpar configurações de API:', error);
  }
}

export function hasAnyApiConfigured(): boolean {
  const config = getApiConfig();
  return !!(config.openai?.apiKey || config.anthropic?.apiKey || config.google?.apiKey || config.grok?.apiKey);
}

export function getActiveProvider(): string | null {
  const config = getApiConfig();
  
  if (config.openai?.apiKey) return 'openai';
  if (config.anthropic?.apiKey) return 'anthropic';
  if (config.google?.apiKey) return 'google';
  if (config.grok?.apiKey) return 'grok';
  
  return null;
}

export interface TestResult {
  ok: boolean;
  status?: number;
  message?: string;
}

export async function testApiConnection(provider: keyof ApiConfig): Promise<TestResult> {
  const config = getApiConfig();
  const providerConfig = config[provider];
  
  if (!providerConfig?.apiKey) {
    return { ok: false, message: 'Chave de API não informada' };
  }

  try {
    // Test connection based on provider
    switch (provider) {
      case 'openai':
        return await testOpenAIConnection(providerConfig.apiKey);
      case 'anthropic':
        return await testAnthropicConnection(providerConfig.apiKey);
      case 'google':
        return await testGoogleConnection(providerConfig.apiKey);
      case 'grok':
        return await testGrokConnection(providerConfig.apiKey);
      default:
        return { ok: false, message: 'Provedor inválido' };
    }
  } catch (error) {
    console.error(`Erro ao testar conexão com ${provider}:`, error);
    return { ok: false, message: (error as Error).message };
  }
}

async function testOpenAIConnection(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) return { ok: true, status: response.status };
    let message: string | undefined;
    try {
      const body = await response.json();
      message = body?.error?.message;
    } catch {}
    return { ok: false, status: response.status, message: message || 'Falha ao conectar à OpenAI' };
  } catch {
    return { ok: false, message: 'Erro de rede ou CORS ao conectar à OpenAI' };
  }
}

async function testAnthropicConnection(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) return { ok: true, status: response.status };
    let message: string | undefined;
    try {
      const body = await response.json();
      message = body?.error?.message;
    } catch {}
    return { ok: false, status: response.status, message: message || 'Falha ao conectar à Anthropic' };
  } catch {
    return { ok: false, message: 'Erro de rede ou CORS ao conectar à Anthropic' };
  }
}

async function testGoogleConnection(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (response.ok) return { ok: true, status: response.status };
    let message: string | undefined;
    try {
      const body = await response.json();
      message = body?.error?.message;
    } catch {}
    return { ok: false, status: response.status, message: message || 'Falha ao conectar ao Google Gemini' };
  } catch {
    return { ok: false, message: 'Erro de rede ou CORS ao conectar ao Google Gemini' };
  }
}

async function testGrokConnection(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch('https://api.x.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) return { ok: true, status: response.status };
    let message: string | undefined;
    try {
      const body = await response.json();
      message = body?.error?.message;
    } catch {}
    return { ok: false, status: response.status, message: message || 'Falha ao conectar ao Grok' };
  } catch {
    return { ok: false, message: 'Erro de rede ou CORS ao conectar ao Grok' };
  }
}