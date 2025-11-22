'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiSettings } from '@/components/ApiSettings';
import { ModernLayout } from '@/components/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Key, 
  AlertCircle, 
  CheckCircle, 
  Shield, 
  Zap,
  Brain,
  Settings as SettingsIcon
} from 'lucide-react';

const providers = [
  {
    name: 'OpenAI GPT',
    description: 'Modelos GPT-3.5 e GPT-4 para análise avançada',
    color: 'from-green-500 to-emerald-600',
    docsUrl: 'https://platform.openai.com/api-keys'
  },
  {
    name: 'Anthropic Claude',
    description: 'Claude 3 para análise contextual e precisa',
    color: 'from-orange-500 to-red-600',
    docsUrl: 'https://console.anthropic.com/'
  },
  {
    name: 'Google Gemini',
    description: 'Gemini Pro para compreensão multimodal',
    color: 'from-blue-500 to-indigo-600',
    docsUrl: 'https://makersuite.google.com/app/apikey'
  },
  {
    name: 'Grok xAI',
    description: 'Grok para análise com conhecimento em tempo real',
    color: 'from-purple-500 to-pink-600',
    docsUrl: 'https://x.ai/api'
  }
];

export default function SettingsPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSettingsSaved = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <ModernLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-2">
                <SettingsIcon className="h-8 w-8 text-primary" />
                <span>Configurações</span>
              </h1>
              <p className="text-muted-foreground">Personalize sua experiência com IA</p>
            </div>
          </div>
          
          {showSuccess && (
            <Badge variant="success" className="animate-scale-in">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configurações salvas
            </Badge>
          )}
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="border-green-200 bg-green-50 animate-fade-in">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Suas configurações foram salvas com sucesso! As mudanças entrarão em vigor imediatamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Security Notice */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Sua privacidade é nossa prioridade</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Suas chaves de API são armazenadas localmente no seu navegador e nunca são enviadas para nossos servidores. 
              Você tem controle total sobre suas credenciais.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>Processamento local • Segurança máxima • Transparência total</span>
            </div>
          </CardContent>
        </Card>

        {/* API Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((provider, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-primary/10">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full rounded-full"
                  onClick={() => window.open(provider.docsUrl, '_blank')}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Obter Chave API
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* API Configuration */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-primary" />
              <span>Configuração de APIs</span>
            </CardTitle>
            <CardDescription>
              Configure suas chaves de API para ativar análises inteligentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApiSettings onSettingsSaved={handleSettingsSaved} />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <span>Como configurar suas APIs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providers.map((provider, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-semibold text-primary">{provider.name}</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Crie uma conta no site do provedor</li>
                    <li>2. Acesse a seção de API Keys</li>
                    <li>3. Gere uma nova chave de API</li>
                    <li>4. Cole a chave no campo correspondente acima</li>
                    <li>5. Teste a conexão clicando no ícone de refresh</li>
                  </ol>
                </div>
              ))}
            </div>
            
            <Alert className="mt-6 border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Dica:</strong> Você pode configurar múltiplos provedores. O sistema usará o primeiro disponível 
                em ordem de prioridade: OpenAI → Anthropic → Google Gemini → Grok.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
}