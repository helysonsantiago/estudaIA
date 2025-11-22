interface Row {
  id: number;
  file_name: string;
  result: any;
  created_at: string;
}

const globalAny = globalThis as any;
const store: Row[] = globalAny.__ANALYSIS_STORE__ ?? [];
globalAny.__ANALYSIS_STORE__ = store;
globalAny.__ANALYSIS_NEXT_ID__ = globalAny.__ANALYSIS_NEXT_ID__ ?? 0;

export interface Analysis {
  id?: number;
  file_name: string;
  result: any;
  created_at?: string;
}

export function saveAnalysis(analysis: Analysis): number {
  const id = ++(globalThis as any).__ANALYSIS_NEXT_ID__;
  const created_at = new Date().toISOString();
  const row: Row = {
    id,
    file_name: analysis.file_name,
    result: analysis.result,
    created_at,
  };
  store.unshift(row);
  return id;
}

export function getAnalysisById(id: number): Analysis | null {
  const row = store.find(r => r.id === id);
  if (!row) return null;
  return {
    id: row.id,
    file_name: row.file_name,
    result: row.result,
    created_at: row.created_at,
  };
}

export function getAllAnalyses(limit: number = 50): Analysis[] {
  return store.slice(0, limit).map(row => ({
    id: row.id,
    file_name: row.file_name,
    result: row.result,
    created_at: row.created_at,
  }));
}

export function deleteAnalysis(id: number): boolean {
  const idx = store.findIndex(r => r.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function clearHistory(): void {
  store.length = 0;
}

