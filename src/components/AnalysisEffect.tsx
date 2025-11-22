'use client';

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Brain, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisEffectProps {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  fileName?: string;
  providerName?: string;
}

export function AnalysisEffect({ isActive, currentStep, totalSteps, fileName, providerName }: AnalysisEffectProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      // Mostra apenas as últimas 3 etapas para evitar crescimento
      const start = Math.max(0, currentStep - 2);
      const end = currentStep + 1;
      setVisibleSteps(Array.from({ length: end - start }, (_, i) => start + i));
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setVisibleSteps([]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep]);

  if (!isVisible) return null;

  const progress = (currentStep / totalSteps) * 100;

  const analysisSteps = [
    { icon: Sparkles, text: "Analisando estrutura..." },
    { icon: Brain, text: "Identificando conceitos..." },
    { icon: Sparkles, text: "Processando informações..." },
    { icon: Brain, text: "Criando mapa mental..." },
    { icon: Sparkles, text: "Gerando resumos..." },
    { icon: Brain, text: "Criando flashcards..." },
    { icon: Sparkles, text: "Desenvolvendo questões..." },
    { icon: Brain, text: "Finalizando..." }
  ];

  return (
    <div className={cn(
      "fixed inset-0 z-50 min-h-screen flex items-center justify-center transition-all duration-300",
      isActive ? "bg-black/50 backdrop-blur-sm" : "bg-black/0 backdrop-blur-0"
    )}>
      <div className={cn(
        "relative w-full max-w-xs mx-4 transition-all duration-300",
        isActive ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}>
        {/* Container ultra minimalista */}
        <div className="relative bg-white/10 backdrop-blur-lg border border-white/15 rounded-xl p-6 text-center">
          
          {/* Centro pequeno */}
          <div className="mb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Título pequeno */}
          <div className="mb-4">
            <h2 className="text-base font-medium text-white mb-1">
              Analisando
            </h2>
            {fileName && (
              <p className="text-xs text-white/70 truncate px-2">
                {fileName}
              </p>
            )}
            {providerName && (
              <p className="text-xs text-white/70 mt-1">
                IA: {providerName}
              </p>
            )}
          </div>

          {/* Barra de progresso fina */}
          <div className="mb-4">
            <div className="h-0.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-white/60 mt-2">
              {Math.round(progress)}%
            </div>
          </div>

          {/* Etapas com fade - máximo 3 visíveis */}
          <div className="space-y-2 max-h-24 overflow-hidden">
            {visibleSteps.map((stepIndex, i) => {
              const step = analysisSteps[stepIndex];
              const Icon = step.icon;
              const isActive = stepIndex === currentStep;
              const isCompleted = stepIndex < currentStep;
              const fadeOpacity = Math.max(0.3, 1 - (visibleSteps.length - 1 - i) * 0.3);
              
              return (
                <div 
                  key={stepIndex} 
                  className="flex items-center space-x-2 text-left transition-all duration-300"
                  style={{ opacity: fadeOpacity }}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
                    isCompleted ? "bg-green-500/20" :
                    isActive ? "bg-[hsl(var(--gradient-start))/20]" :
                    "bg-white/10"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    ) : (
                      <Icon className={cn("h-3 w-3", isActive ? "text-[hsl(var(--gradient-start))]" : "text-white/60")} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-xs truncate",
                      isActive ? "text-white font-medium" : isCompleted ? "text-green-400" : "text-white/60"
                    )}>
                      {step.text}
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Identificação da IA no final */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center">
                <Brain className="h-2 w-2 text-white" />
              </div>
              <span className="text-xs text-white/60 font-medium">{providerName ? providerName : 'IA ativa'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}