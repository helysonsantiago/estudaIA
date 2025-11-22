import { NextRequest, NextResponse } from 'next/server';
import { saveAnalysis, getAllAnalyses, getAnalysisById, deleteAnalysis } from '@/lib/database';

// GET /api/analyses - List all analyses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get specific analysis by ID
      const analysis = getAnalysisById(parseInt(id));
      if (!analysis) {
        return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 });
      }
      return NextResponse.json(analysis);
    } else {
      // Get all analyses
      const analyses = getAllAnalyses();
      return NextResponse.json(analyses);
    }
  } catch (error) {
    console.error('Erro ao buscar análises:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/analyses - Save new analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file_name, result } = body;
    
    if (!file_name || !result) {
      return NextResponse.json({ error: 'file_name e result são obrigatórios' }, { status: 400 });
    }
    
    const id = saveAnalysis({ file_name, result });
    return NextResponse.json({ id, message: 'Análise salva com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar análise:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/analyses - Delete analysis
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    const success = deleteAnalysis(parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Análise deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar análise:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}