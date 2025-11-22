'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AIThinkingLinesProps {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
}

export function AIThinkingLines({ isActive, currentStep, totalSteps }: AIThinkingLinesProps) {
  const [lines, setLines] = useState([
    { id: 0, active: false, text: "Analisando estrutura da planilha..." },
    { id: 1, active: false, text: "Identificando colunas principais..." },
    { id: 2, active: false, text: "Processando dados educacionais..." }
  ]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setLines(prev => prev.map(line => ({
          ...line,
          active: line.id === (currentStep % 3)
        })));
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isActive, currentStep]);

  if (!isActive) return null;

  return (
    <div className="flex flex-col gap-1 w-full max-w-md mx-auto p-4">
      {lines.map((line, index) => {
        const isCurrent = line.active;
        const isPrevious = (currentStep > 0 && (index === (currentStep - 1) % 3));
        const isFuture = (index === (currentStep + 1) % 3);
        
        const bgColor = isCurrent ? 'bg-gray-600' :
                         isPrevious ? 'bg-gray-400' :
                         'bg-gray-200';
        
        const height = isCurrent ? 'h-3' : 'h-2';
        const opacity = isCurrent ? 'opacity-100' :
                       isPrevious ? 'opacity-70' :
                       isFuture ? 'opacity-50' : 'opacity-30';
        
        return (
          <div key={line.id} className="space-y-1">
            <div className={cn(
              'rounded-full transition-all duration-500 ease-in-out',
              bgColor,
              height,
              opacity,
              'animate-pulse'
            )}></div>
            
            {isCurrent && (
              <div className="text-xs text-gray-600 ml-2 animate-fade-in">
                {line.text}
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
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all duration-300',
                i === currentStep % 3 ? 'bg-blue-500' : 'bg-gray-300'
              )}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}