'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AIThinkingVisualizationProps {
  reasoningLines: string[];
  currentLine: number;
  isActive: boolean;
}

export function AIThinkingVisualization({ 
  reasoningLines, 
  currentLine, 
  isActive 
}: AIThinkingVisualizationProps) {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [animatedLines, setAnimatedLines] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isActive && reasoningLines.length > 0) {
      // Atualizar linhas exibidas progressivamente
      const timer = setTimeout(() => {
        setDisplayLines(reasoningLines.slice(0, currentLine + 1));
        setAnimatedLines(prev => new Set([...prev, currentLine]));
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [reasoningLines, currentLine, isActive]);

  if (!isActive || reasoningLines.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-600">
            IA Processando...
          </span>
        </div>
        
        <div className="space-y-2">
          {displayLines.map((line, index) => {
            const isCurrentLine = index === currentLine;
            const isRecentLine = index >= currentLine - 1;
            const opacity = isCurrentLine ? 'opacity-100' : 
                           isRecentLine ? 'opacity-70' : 'opacity-40';
            const fontWeight = isCurrentLine ? 'font-semibold' : 'font-normal';
            const backgroundColor = isCurrentLine ? 'bg-gray-200' : 
                                   isRecentLine ? 'bg-gray-100' : 
                                   'bg-transparent';
            
            return (
              <div
                key={index}
                className={cn(
                  'px-3 py-2 rounded-lg transition-all duration-500 ease-in-out transform',
                  opacity,
                  fontWeight,
                  backgroundColor,
                  'animate-fade-in',
                  {
                    'scale-105 shadow-sm': isCurrentLine,
                    'translate-x-0': animatedLines.has(index),
                    'translate-x-4': !animatedLines.has(index)
                  }
                )}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0',
                    isCurrentLine ? 'bg-blue-500 animate-pulse' : 
                    isRecentLine ? 'bg-blue-400' : 'bg-blue-300'
                  )}></div>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    {line}
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Linhas futuras (placeholder) */}
          {reasoningLines.length > displayLines.length && (
            <div className="space-y-2 mt-2">
              {[...Array(Math.min(3, reasoningLines.length - displayLines.length))].map((_, index) => (
                <div
                  key={`placeholder-${index}`}
                  className="px-3 py-2 rounded-lg bg-gray-50 opacity-30 animate-pulse"
                >
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Barra de progresso visual */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso do raciocínio</span>
            <span>{currentLine + 1} / {reasoningLines.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentLine + 1) / reasoningLines.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}