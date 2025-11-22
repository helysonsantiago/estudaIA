'use client';

import { useState } from 'react';
import { Brain, Sparkles, BookOpen, Clock, Users, Settings, Upload, FileText, Zap } from 'lucide-react';
import { FileUploadSimple } from '@/components/FileUploadSimple';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadProgress } from '@/types/analysis';
import { useRouter } from 'next/navigation';
import { History } from '@/components/History';
import { addToHistory } from '@/lib/history';
import { getApiConfig } from '@/lib/apiConfig';
import { ModernLayout } from '@/components/ModernLayout';

export default function HomeDebug() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string[]>([]);
  const [currentReasoningStep, setCurrentReasoningStep] = useState(0);
  const [showAIRasoning, setShowAIRasoning] = useState(false);
  const router = useRouter();

  const handleFileSelect = async (file: File) => {
    console.log('Iniciando processamento do arquivo:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type);
    
    setIsUploading(true);
    setError(null);
    setShowAIRasoning(true);
    setCurrentReasoningStep(0);
    
    // Simular raciocínio da IA para planilhas
    const spreadsheetReasoning = [
      "Analisando estrutura da planilha...",
      "Identificando colunas de dados principais...",
      "Processando informações educacionais...",
      "Criando mapa mental dos conceitos...",
      "Gerando resumos personalizados...",
      "Criando flashcards otimizados...",
      "Desenvolvendo questões de revisão...",
      "Finalizando conteúdo educacional..."
    ];
    
    const documentReasoning = [
      "Analisando estrutura do documento...",
      "Identificando conceitos-chave...",
      "Processando informações principais...",
      "Criando resumo inteligente...",
      "Gerando flashcards relevantes...",
      "Desenvolvendo questões práticas...",
      "Criando cronograma de estudos...",
      "Finalizando material educacional..."
    ];
    
    const isSpreadsheet = file.name.match(/\.(xlsx|xls|csv)$/i);
    const reasoningLines = isSpreadsheet ? spreadsheetReasoning : documentReasoning;
    setAiReasoning(reasoningLines);
    
    // Simular progresso do raciocínio
    const reasoningInterval = setInterval(() => {
      setCurrentReasoningStep(prev => {
        if (prev >= reasoningLines.length - 1) {
          clearInterval(reasoningInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    
    try {
      // Criar FormData com mais cuidado
      const formData = new FormData();
      
      // Verificar se o arquivo pode ser lido
      console.log('Adicionando arquivo ao FormData...');
      formData.append('file', file);
      console.log('Arquivo adicionado com sucesso');
      
      // Adicionar configurações da API
      try {
        const config = getApiConfig() as any;
        let provider: string | null = null;
        if (config?.google?.apiKey) provider = 'google';
        else if (config?.openai?.apiKey) provider = 'openai';
        else if (config?.anthropic?.apiKey) provider = 'anthropic';
        else if (config?.grok?.apiKey) provider = 'grok';
        
        if (provider) {
          formData.append('provider', provider);
          formData.append('apiKey', config[provider]?.apiKey);
          if (config[provider]?.model) {
            formData.append('model', config[provider].model);
          }
        }
      } catch (configError) {
        console.warn('Erro ao obter configurações da API:', configError);
      }

      console.log('Enviando requisição para /api/analyze...');
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        // Adicionar headers para evitar problemas de CORS
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Resposta recebida:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Erro ao processar arquivo';
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          errorDetails = errorData.details || '';
          console.error('Erro do servidor:', errorData);
        } catch (e) {
          try {
            const errorText = await response.text();
            console.error('Resposta de erro do servidor:', errorText);
            errorDetails = errorText.substring(0, 200);
          } catch (textError) {
            console.error('Erro ao ler texto do erro:', textError);
          }
        }
        
        throw new Error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
      }

      console.log('Processando resposta JSON...');
      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      clearInterval(reasoningInterval);
      setShowAIRasoning(false);
      
      addToHistory(file.name, data.result);
      sessionStorage.setItem('analysisResult', JSON.stringify(data.result));
      
      console.log('Redirecionando para /results...');
      router.push('/results');
      
    } catch (error) {
      console.error('Erro completo no upload:', error);
      clearInterval(reasoningInterval);
      setShowAIRasoning(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo';
      
      // Tratamento específico para erros de permissão
      if (errorMessage.includes('permission') || errorMessage.includes('permissão') || errorMessage.includes('Permission')) {
        setError('Permissão negada para acessar o arquivo. Isso pode acontecer com arquivos protegidos ou em uso. Tente copiar o arquivo para outra pasta ou usar um arquivo diferente.');
      } else if (errorMessage.includes('network')) {
        setError('Erro de rede. Verifique sua conexão e tente novamente.');
      } else if (errorMessage.includes('timeout')) {
        setError('Tempo limite excedido. O arquivo pode ser muito grande ou a conexão está lenta.');
      } else {
        setError(errorMessage);
      }
      
      setIsUploading(false);
    }
  };

  const handleUploadProgress = (progress: UploadProgress) => {
    console.log('Progresso do upload:', progress.percentage + '%');
    setUploadProgress(progress);
  };

  const handleError = (errorMessage: string) => {
    console.error('Erro recebido do componente filho:', errorMessage);
    setError(errorMessage);
  };

  const features = [
    {
      icon: Sparkles,
      title: "Análise Inteligente",
      description: "IA avançada extrai os conceitos mais importantes do seu material",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BookOpen,
      title: "Material Completo",
      description: "Resumos, flashcards, quizzes e cronogramas personalizados",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "Economia de Tempo",
      description: "Estude de forma mais eficiente com conteúdo otimizado",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Processamento Rápido",
      description: "Análise instantânea de PDFs, documentos e apresentações",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <ModernLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Debug Info */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm font-mono">
                <div>Estado: {isUploading ? 'Uploading' : 'Idle'}</div>
                <div>Raciocínio: {showAIRasoning ? 'Ativo' : 'Inativo'}</div>
                <div>Passo atual: {currentReasoningStep}</div>
                <div className="text-red-700">Erro: {error}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            <span>IA Educacional de Ponta</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Transforme seus materiais em 
            <span className="gradient-text"> conteúdo educacional</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A inteligência artificial que revoluciona sua forma de estudar. 
            Análise profunda, resumos inteligentes e materiais personalizados em segundos.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Estudantes", value: "10K+" },
            { label: "Documentos Analisados", value: "50K+" },
            { label: "Taxa de Aprovação", value: "95%" },
            { label: "Tempo Economizado", value: "80%" }
          ].map((stat, index) => (
            <Card key={index} className="text-center p-4 border-primary/10">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Section */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Comece sua análise</CardTitle>
            <CardDescription className="text-base">
              Envie seu material e deixe nossa IA criar o conteúdo perfeito para seus estudos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadSimple
              onFileSelect={handleFileSelect}
              onUploadProgress={handleUploadProgress}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              error={error}
              onError={handleError}
            />
            
            {/* Visualização do raciocínio da IA */}
            {showAIRasoning && (
              <div className="mt-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-600">
                      IA Processando...
                    </span>
                  </div>
                  
                  {/* Componente de linhas animadas */}
                  <div className="flex flex-col gap-1 w-full max-w-md mx-auto">
                    {[0, 1, 2].map((index) => {
                      const isCurrent = index === (currentReasoningStep % 3);
                      const isPrevious = (currentReasoningStep > 0 && (index === (currentReasoningStep - 1) % 3));
                      
                      const bgColor = isCurrent ? 'bg-gray-600' :
                                     isPrevious ? 'bg-gray-400' :
                                     'bg-gray-200';
                      
                      const height = isCurrent ? 'h-3' : 'h-2';
                      const opacity = isCurrent ? 'opacity-100' :
                                     isPrevious ? 'opacity-70' : 'opacity-30';
                      
                      return (
                        <div key={index} className="space-y-1">
                          <div className={`rounded-full transition-all duration-500 ease-in-out ${bgColor} ${height} ${opacity} animate-pulse`}></div>
                          
                            {isCurrent && (
                            <div className="text-xs text-gray-600 ml-2 animate-fade-in">
                              {aiReasoning[currentReasoningStep] || 'Processando...'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Indicador de progresso */}
                    <div className="mt-3 flex items-center justify-center">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              i === currentReasoningStep % 3 ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-primary/10">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* History Section */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Histórico Recentemente Analisado</span>
            </CardTitle>
            <CardDescription>
              Acesse seus materiais analisados anteriormente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <History />
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl p-8">
          <Users className="h-12 w-12 text-primary mx-auto" />
          <h3 className="text-2xl font-bold">Junte-se a milhares de estudantes</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estudantes de todo o mundo estão usando EstudaIA para melhorar seus resultados acadêmicos 
            e economizar tempo na preparação de materiais de estudo.
          </p>
          <Button size="lg" className="rounded-full">
            Comece Agora Gratuitamente
          </Button>
        </div>
      </div>
    </ModernLayout>
  );
}