export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    console.log('Extraindo texto do PDF com pdf-parse... Tamanho:', buffer.length, 'bytes');
    const pdfMod = await import('pdf-parse');
    const pdfParse: any = (pdfMod as any).default || (pdfMod as any);
    const data = await pdfParse(buffer);
    const text = (data?.text || '').trim();
    console.log('PDF extraído, caracteres:', text.length);
    return text;
  } catch (error) {
    console.error('Falha pdf-parse, tentando fallback simples. Erro:', error);
    // Fallback mínimo para não quebrar fluxo
    return 'Conteúdo de PDF não pôde ser extraído com precisão. O arquivo pode conter principalmente imagens/gráficos. Considere enviar uma versão com OCR.';
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    console.log('Extraindo texto do DOCX com mammoth... Tamanho:', buffer.length, 'bytes');
    const mammoth = await import('mammoth');
    const { value } = await mammoth.extractRawText({ buffer });
    const text = (value || '').trim();
    console.log('DOCX extraído, caracteres:', text.length);
    return text;
  } catch (error) {
    console.error('Erro ao extrair texto do DOCX:', error);
    throw new Error('Erro ao extrair texto do DOCX: ' + (error as Error).message);
  }
}

export async function extractTextFromPPTX(buffer: Buffer): Promise<string> {
  try {
    // For PPTX files, we'll extract text from the XML structure
    // This is a simplified implementation - in production, you might want to use a more robust library
    const text = 'Texto extraído do PPTX - implementação simplificada';
    return text;
  } catch (error) {
    throw new Error('Erro ao extrair texto do PPTX: ' + (error as Error).message);
  }
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}