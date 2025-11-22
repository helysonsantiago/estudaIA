'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatFileSize } from '@/lib/fileProcessing';
import { UploadProgress } from '@/types/analysis';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUploadProgress: (progress: UploadProgress) => void;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  error: string | null;
  onError?: (error: string) => void;
}

export function FileUploadSimple({ 
  onFileSelect, 
  onUploadProgress, 
  isUploading, 
  uploadProgress, 
  error, 
  onError
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    try {
      // Verificar se o arquivo existe e é acessível
      if (!file) {
        return { valid: false, error: 'Nenhum arquivo selecionado' };
      }

      // Verificar tamanho
      if (file.size === 0) {
        return { valid: false, error: 'Arquivo vazio ou corrompido' };
      }

      if (file.size > 25 * 1024 * 1024) {
        return { valid: false, error: 'Arquivo muito grande (máximo 25MB)' };
      }

      // Verificar tipo de arquivo
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];

      if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|pptx|xlsx|xls|csv)$/i)) {
        return { valid: false, error: 'Tipo de arquivo não suportado' };
      }

      return { valid: true };
    } catch (err) {
      console.error('Erro na validação do arquivo:', err);
      return { valid: false, error: 'Erro ao validar arquivo' };
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    try {
      console.log('Processando arquivo:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type);
      
      const validation = validateFile(file);
      if (!validation.valid) {
        if (onError && validation.error) {
          onError(validation.error);
        }
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo';
      
      if (onError) {
        onError(errorMessage.includes('permission') || errorMessage.includes('permissão') 
          ? 'Permissão negada para acessar o arquivo. Verifique as permissões ou tente outro arquivo.'
          : errorMessage);
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleFileSelection(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive: isDragActiveDropzone } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxSize: 25 * 1024 * 1024,
    multiple: false,
    disabled: isUploading,
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onUploadProgress({ loaded: 0, total: 0, percentage: 0 });
  };

  const fileInput = (
    <input
      type="file"
      onChange={handleFileInput}
      accept=".pdf,.docx,.pptx,.xlsx,.xls,.csv"
      className="hidden"
      id="file-input"
      disabled={isUploading}
    />
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Erro ao processar arquivo</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <p className="text-red-600 text-xs mt-2">
            Dica: Tente usar o botão de seleção de arquivo abaixo, ou arraste um arquivo diferente.
          </p>
        </div>
      )}

      {!selectedFile && !isUploading && (
        <div className="space-y-4">
          {/* Área de arrastar */}
          <div
            {...getRootProps()}
            className={cn(
              "group relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer",
              "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
              isDragActiveDropzone && "border-primary bg-primary/10 scale-105",
              "hover:shadow-lg hover:shadow-primary/10"
            )}
          >
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                {isDragActiveDropzone ? (
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                ) : (
                  <Upload className="h-8 w-8 text-white" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {isDragActiveDropzone ? 'Solte o arquivo aqui!' : 'Arraste seu arquivo ou clique para enviar'}
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

          {/* Botão alternativo para problemas de permissão */}
          <div className="text-center">
            <label
              htmlFor="file-input"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-lg cursor-pointer hover:bg-primary/20 transition-colors text-sm"
            >
              <FileText className="h-4 w-4" />
              <span>Ou clique aqui para selecionar arquivo</span>
            </label>
            {fileInput}
          </div>
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
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
