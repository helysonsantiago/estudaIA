'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle, Loader2, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatFileSize } from '@/lib/fileProcessing';
import { UploadProgress } from '@/types/analysis';
import { cn } from '@/lib/utils';
import { AIThinkingLines } from '@/components/AIThinkingLines';
import { AIThinkingVisualization } from '@/components/AIThinkingVisualization';
import { AnalysisEffect } from '@/components/AnalysisEffect';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUploadProgress: (progress: UploadProgress) => void;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  error: string | null;
  aiReasoning?: string[];
  currentReasoningStep?: number;
  showAIRasoning?: boolean;
  onError?: (error: string) => void;
  providerName?: string;
}

export function FileUpload({ 
  onFileSelect, 
  onUploadProgress, 
  isUploading, 
  uploadProgress, 
  error, 
  aiReasoning = [],
  currentReasoningStep = 0,
  showAIRasoning = false,
  onError,
  providerName
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      if (file) {
        // Verificar permissões e validações adicionais
        console.log('Arquivo recebido:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type);
        
        // Verificar se o arquivo não está bloqueado
        if (file.size === 0) {
          throw new Error('Arquivo vazio ou corrompido');
        }
        
        setSelectedFile(file);
        onFileSelect(file);
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      // Propagar erro para o componente pai
      if (error instanceof Error) {
        const errorMessage = error.message.includes('permission') || error.message.includes('permissão') 
          ? 'Permissão negada para acessar o arquivo. Verifique as permissões do arquivo ou tente outro arquivo.'
          : error.message;
        
        if (onError) {
          onError(errorMessage);
        }
        console.error('Detalhes do erro:', error.message);
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false,
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onUploadProgress({ loaded: 0, total: 0, percentage: 0 });
  };

  const maxSize = 25 * 1024 * 1024; // 25MB

  return (
    <div className="space-y-4">
      {/* Efeito de análise durante upload */}
      <AnalysisEffect 
        isActive={isUploading && showAIRasoning}
        currentStep={currentReasoningStep}
        totalSteps={aiReasoning.length}
        fileName={selectedFile?.name}
        providerName={providerName}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Erro ao processar arquivo</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {!selectedFile && !isUploading && (
        <div
          {...getRootProps()}
          className={cn(
            "group relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer",
            "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
            isDragActive && "border-primary bg-primary/10 scale-105",
            "hover:shadow-lg hover:shadow-primary/10"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isDragActive ? (
                <Sparkles className="h-8 w-8 text-white animate-pulse" />
              ) : (
                <Upload className="h-8 w-8 text-white" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {isDragActive ? 'Solte o arquivo aqui!' : 'Arraste seu arquivo ou clique para enviar'}
              </h3>
              <p className="text-muted-foreground text-sm">
                Suportamos PDFs, documentos Word, PowerPoint e Excel até 25MB
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>PDF</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>DOCX</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>PPTX</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>Excel</span>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      )}

      {selectedFile && (
        <Card className="border-primary/20 shadow-lg animate-scale-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium">{selectedFile.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {formatFileSize(selectedFile.size)}
                  </CardDescription>
                </div>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          {isUploading && uploadProgress && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processando arquivo...</span>
                  <span className="font-medium">{Math.round(uploadProgress.percentage)}%</span>
                </div>
                <Progress value={uploadProgress.percentage} className="h-2" />
                
                {/* Visualização do raciocínio da IA */}
                {showAIRasoning && (
                  <div className="mt-4">
                    <AIThinkingLines 
                      isActive={true}
                      currentStep={currentReasoningStep}
                      totalSteps={aiReasoning.length}
                    />
                  </div>
                )}
                
                {!showAIRasoning && (
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Analisando conteúdo com IA...</span>
                  </div>
                )}
              </div>
            </CardContent>
          )}
          
          {!isUploading && (
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Arquivo pronto para análise</span>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}