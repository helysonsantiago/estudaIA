'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Info, Settings, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { hasAnyApiConfigured, getActiveProvider } from '@/lib/apiConfig';

export function ApiStatusIndicator() {
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check API configuration status
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const hasApi = hasAnyApiConfigured();
      const provider = getActiveProvider();
      setIsApiConfigured(hasApi);
      setActiveProvider(provider);
    } catch (error) {
      console.error('Erro ao verificar status da API:', error);
      setIsApiConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  const goToSettings = () => {
    router.push('/settings');
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl border border-white/20 bg-white/10 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-muted-foreground">
              Verificando configuração da API...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isApiConfigured) {
    return (
      <Card className="rounded-xl border border-white/20 bg-white/10 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-600" />
            <CardTitle>Modo de Demonstração</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            A aplicação está funcionando com dados de exemplo
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Análises geradas com conteúdo educacional de exemplo</p>
            <p>• Funcionalidade completa para teste da aplicação</p>
            <p>• Para análises reais, configure uma API de IA</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToSettings}
            className="mt-3 rounded-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar API
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-white/20 bg-white/10 backdrop-blur">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-muted-foreground">
              {activeProvider ? `${activeProvider} configurada` : 'API configurada'} - Análises reais ativadas
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToSettings}
            className="rounded-full"
          >
            <Settings className="h-3 w-3 mr-1" />
            Ajustes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}