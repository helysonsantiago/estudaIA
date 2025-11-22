import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, extractTextFromDOCX, extractTextFromPPTX, getFileExtension } from '@/lib/fileProcessing';
import { generateAnalysis, extractTextWithGeminiFromPDF } from '@/lib/aiService';
import { AnalysisResult } from '@/types/analysis';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('Recebendo requisição de análise...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const blobUrl = formData.get('blobUrl') as string | null;
    const provider = formData.get('provider') as string | null;
    const apiKey = formData.get('apiKey') as string | null;
    let model = formData.get('model') as string | null;
    const overrideFilename = formData.get('filename') as string | null;
    const overrideContentType = formData.get('contentType') as string | null;
    
    console.log('Arquivo recebido:', file?.name || overrideFilename, 'Tamanho:', file?.size, 'blobUrl?', !!blobUrl);
    
    if (!file && !blobUrl) {
      console.error('Nenhum arquivo enviado');
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    if (file.size > maxSize) {
      console.error('Arquivo muito grande:', file.size, 'bytes');
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 25MB.' }, { status: 400 });
    }

    // Validate file type
    const allowedExtensions = ['pdf', 'docx', 'pptx'];
    let fileExtension = file ? getFileExtension(file.name) : (overrideFilename ? getFileExtension(overrideFilename) : '');
    if (!fileExtension && overrideContentType) {
      const ct = overrideContentType.toLowerCase();
      if (ct.includes('pdf')) fileExtension = 'pdf';
      else if (ct.includes('presentation')) fileExtension = 'pptx';
      else if (ct.includes('wordprocessingml')) fileExtension = 'docx';
    }
    
    console.log('Extensão do arquivo:', fileExtension);
    
    if (!allowedExtensions.includes(fileExtension)) {
      console.error('Tipo de arquivo não suportado:', fileExtension);
      return NextResponse.json({ 
        error: 'Tipo de arquivo não suportado. Use: PDF, DOCX ou PPTX.' 
      }, { status: 400 });
    }

    // Convert file to buffer
    let buffer: Buffer;
    if (file) {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    } else {
      const res = await fetch(blobUrl!);
      if (!res.ok) {
        return NextResponse.json({ error: 'Falha ao baixar arquivo do Blob' }, { status: 502 });
      }
      const bytes = await res.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    // Extract text based on file type
    let extractedText = '';
    
    try {
      switch (fileExtension) {
        case 'pdf':
          extractedText = await extractTextFromPDF(buffer);
          break;
        case 'docx':
          extractedText = await extractTextFromDOCX(buffer);
          break;
        case 'pptx':
          extractedText = await extractTextFromPPTX(buffer);
          break;
        default:
          return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 });
      }
    } catch (error) {
      console.error('Erro na extração de texto:', error);
      return NextResponse.json({ 
        error: 'Erro ao extrair texto do arquivo. Verifique se o arquivo não está corrompido.' 
      }, { status: 500 });
    }

    // Validate extracted text
    let textLen = (extractedText || '').trim().length;
    console.log('Texto extraído tamanho:', textLen);
    if (!extractedText || textLen < 50) {
      return NextResponse.json({ 
        error: 'Texto extraído muito curto ou inválido. Verifique o arquivo.' 
      }, { status: 400 });
    }
    if (textLen < 300) {
      console.warn('Texto curto; resultado pode ser genérico');
      // Tentar extrair melhor via Gemini se disponível e for PDF
      if (fileExtension === 'pdf' && provider === 'google' && apiKey) {
        try {
          console.log('Tentando extração via Gemini (PDF inline)');
          const improvedText = await extractTextWithGeminiFromPDF(buffer, apiKey, model || 'gemini-flash-latest');
          if (improvedText && improvedText.length > textLen) {
            extractedText = improvedText;
            textLen = improvedText.length;
            console.log('Texto melhorado via Gemini, tamanho:', textLen);
          }
        } catch (err) {
          console.warn('Falha na extração via Gemini, mantendo texto curto', err);
        }
      }
    }

    // Generate analysis with AI
    let analysis;
    try {
      if (provider === 'google' && (!model || model.trim() === '')) {
        model = 'gemini-flash-latest';
      }
      console.log('IA selecionada:', provider, 'modelo:', model);
      analysis = await generateAnalysis(extractedText, file.name, {
        provider: provider || undefined,
        apiKey: apiKey || undefined,
        model: model || undefined,
      });
    } catch (error) {
      console.error('Erro na análise IA:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar análise com IA';
      
      // Check if it's an API key error
      if (errorMessage.includes('API key') || errorMessage.includes('chave')) {
        return NextResponse.json({ 
          error: 'Chave de API da OpenAI não configurada. A aplicação está usando dados de demonstração.',
          details: 'Para análises reais, configure a variável OPENAI_API_KEY no arquivo .env.local'
        }, { status: 503 });
      }
      if (errorMessage.toLowerCase().includes('gemini')) {
        return NextResponse.json({
          error: 'Falha ao chamar Gemini',
          details: errorMessage
        }, { status: 502 });
      }
      
      return NextResponse.json({ 
        error: errorMessage
      }, { status: 500 });
    }

    // Create result object
    const result: AnalysisResult = {
      id: Date.now().toString(),
      filename: file.name,
      uploadDate: new Date().toISOString(),
      summary: analysis.summary,
      references: analysis.references || [],
      conceptMap: analysis.conceptMap,
      keyConcepts: analysis.keyConcepts,
      flashcards: analysis.flashcards,
      quiz: analysis.quiz,
      studySchedules: analysis.studySchedules,
    };

    return NextResponse.json({ result, meta: { provider: provider || 'demo', model: model || null } });

  } catch (error) {
    console.error('Erro no processamento:', error);
    return NextResponse.json({ 
      error: 'Erro interno no processamento do arquivo.' 
    }, { status: 500 });
  }
}
