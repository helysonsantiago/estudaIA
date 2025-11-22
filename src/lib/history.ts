import { Analysis } from '@/lib/database';

export interface HistoryItem {
  id: number;
  fileName: string;
  result: any;
  timestamp: string;
}

export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const response = await fetch('/api/analyses');
    if (!response.ok) throw new Error('Erro ao buscar histórico');
    
    const analyses: Analysis[] = await response.json();
    return analyses.map(analysis => ({
      id: analysis.id!,
      fileName: analysis.file_name,
      result: analysis.result,
      timestamp: analysis.created_at!
    }));
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    return [];
  }
}

export async function addToHistory(fileName: string, result: any): Promise<number> {
  try {
    const response = await fetch('/api/analyses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: fileName,
        result: result
      }),
    });
    
    if (!response.ok) throw new Error('Erro ao salvar análise');
    
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Erro ao salvar no histórico:', error);
    throw error;
  }
}

export async function removeFromHistory(id: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/analyses?id=${id}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erro ao remover do histórico:', error);
    return false;
  }
}

export function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Há poucos minutos';
  } else if (diffInHours < 24) {
    return `Há ${Math.floor(diffInHours)} horas`;
  } else if (diffInHours < 48) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}