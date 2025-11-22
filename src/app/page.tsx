'use client';

import { useState } from 'react';
import { Brain, Sparkles, BookOpen, Clock, Users, Settings, Upload, FileText, Zap } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadProgress } from '@/types/analysis';
import { useRouter } from 'next/navigation';
import { History } from '@/components/History';
import { addToHistory } from '@/lib/history';
import { getApiConfig } from '@/lib/apiConfig';
import { ModernLayout } from '@/components/ModernLayout';
import { upload } from '@vercel/blob/client';

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string[]>([]);
  const [currentReasoningStep, setCurrentReasoningStep] = useState(0);
  const [showAIRasoning, setShowAIRasoning] = useState(false);
  const router = useRouter();

  let providerLabel: string | undefined;
  try {
    const config = getApiConfig() as any;
    if (config?.google?.apiKey) providerLabel = 'Google Gemini';
    else if (config?.openai?.apiKey) providerLabel = 'OpenAI GPT';
    else if (config?.anthropic?.apiKey) providerLabel = 'Anthropic Claude';
    else if (config?.grok?.apiKey) providerLabel = 'Grok xAI';
  } catch {}

  // Test function to check navigation
  const testNavigation = () => {
    console.log('Testing navigation to /results');
    router.push('/results');
  };

  const handleFileSelect = async (file: File) => {
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
    
    const formData = new FormData();
    
    let providerLabel: string | null = null;
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
        providerLabel = (
          provider === 'google' ? 'Google Gemini' :
          provider === 'openai' ? 'OpenAI GPT' :
          provider === 'anthropic' ? 'Anthropic Claude' :
          provider === 'grok' ? 'Grok xAI' : 'IA ativa'
        );
      }
    } catch {}

    try {
      let response: Response;
      if (file.size > 4.5 * 1024 * 1024) {
        const newBlob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/blob/upload',
          multipart: true,
        });
        const blobUrl = newBlob.url || newBlob.downloadUrl;
        const analyzeForm = new FormData();
        analyzeForm.append('blobUrl', blobUrl);
        analyzeForm.append('filename', file.name);
        analyzeForm.append('contentType', file.type || '');
        if (providerLabel) analyzeForm.append('provider', (providerLabel.includes('Google') ? 'google' : providerLabel.includes('OpenAI') ? 'openai' : providerLabel.includes('Anthropic') ? 'anthropic' : providerLabel.includes('Grok') ? 'grok' : ''));
        try {
          const config = getApiConfig() as any;
          const provider = analyzeForm.get('provider')?.toString() || null;
          if (provider && config?.[provider]?.apiKey) {
            analyzeForm.append('apiKey', config[provider].apiKey);
            if (config[provider]?.model) analyzeForm.append('model', config[provider].model);
          }
        } catch {}
        response = await fetch('/api/analyze', { method: 'POST', body: analyzeForm });
      } else {
        formData.append('file', file);
        response = await fetch('/api/analyze', { method: 'POST', body: formData });
      }

      if (!response.ok) {
        let errorMessage = 'Erro ao processar arquivo';
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {}
        } else {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch {}
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      clearInterval(reasoningInterval);
      setShowAIRasoning(false);
      
      // Salvar no banco de dados via API
      let analysisId: number | null = null;
      try {
        analysisId = await addToHistory(file.name, data.result);
        console.log('Análise salva no banco com ID:', analysisId);
      } catch (dbError) {
        console.error('Erro ao salvar no banco:', dbError);
        // Continuar mesmo se o banco falhar - usar sessionStorage como fallback
      }
      
      sessionStorage.setItem('analysisResult', JSON.stringify(data.result));
      if (analysisId && Number.isFinite(analysisId)) {
        router.push(`/results/${analysisId}`);
      } else {
        router.push('/results');
      }
      
    } catch (error) {
      console.error('Erro no upload:', error);
      clearInterval(reasoningInterval);
      setShowAIRasoning(false);
      setError(error instanceof Error ? error.message : 'Erro ao processar arquivo');
      setIsUploading(false);
    }
  };

  const handleUploadProgress = (progress: UploadProgress) => {
    setUploadProgress(progress);
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
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] text-white px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            <span>IA Educacional de Ponta</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Transforme seus materiais em 
            <span className="text-gradient-animated"> conteúdo educacional</span>
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
            <Card key={index} className="text-center p-4 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-gradient-animated">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Section */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-gradient-animated">Comece sua análise</CardTitle>
            <CardDescription className="text-base">
              Envie seu material e deixe nossa IA criar o conteúdo perfeito para seus estudos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={handleFileSelect}
              onUploadProgress={handleUploadProgress}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              error={error}
              aiReasoning={aiReasoning}
              currentReasoningStep={currentReasoningStep}
              showAIRasoning={showAIRasoning}
              onError={setError}
              providerName={providerLabel || undefined}
            />
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group glass-card">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gradient-animated">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Test Navigation Button */}
        <div className="text-center mb-6">
          <Button onClick={testNavigation} variant="outline" className="hover-glow">
            Testar Navegação para /results
          </Button>
        </div>

        {/* History Section */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gradient-animated">
              <Clock className="h-5 w-5 text-gradient-animated" />
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
        <div className="text-center space-y-4 glass-card rounded-2xl p-8">
          <Users className="h-12 w-12 text-gradient-animated mx-auto" />
          <h3 className="text-2xl font-bold text-gradient-animated">Junte-se a milhares de estudantes</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estudantes de todo o mundo estão usando EstudaIA para melhorar seus resultados acadêmicos 
            e economizar tempo na preparação de materiais de estudo.
          </p>
          <Button size="lg" className="cta-primary">
            Comece Agora Gratuitamente
          </Button>
        </div>
      </div>
    </ModernLayout>
  );
}
