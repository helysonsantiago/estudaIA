// app/results/page.tsx  (ou app/(main)/results/page.tsx)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Trash2,
  ChevronRight,
  Layers,
  BookOpen,
  Brain,
  Upload,
} from "lucide-react";

type AnalysisResult = {
  summary?: string;
  keyConcepts?: any[];
  flashcards?: any[];
  quiz?: any[];
};

type AnalysisItem = {
  id: number;
  file_name: string;
  result: AnalysisResult;
  created_at: string;
};

export default function ResultsListPage() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analyses")
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao carregar");
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setAnalyses(data);
      })
      .catch((err) => {
        console.error(err);
        setAnalyses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Deletar esta análise permanentemente?")) return;

    try {
      const res = await fetch(`/api/analyses?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao deletar");
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert("Erro ao deletar. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Upload className="w-10 h-10 mx-auto text-blue-600 animate-pulse" />
          <p className="mt-3 text-sm text-gray-600">Carregando análises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Minhas Análises
            </h1>
            <p className="text-gray-600 mt-1">{analyses.length} materiais transformados</p>
          </div>

          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
              <Upload className="w-4 h-4 mr-2" />
              Novo Upload
            </Button>
          </Link>
        </div>

        {/* Lista */}
        {analyses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma análise ainda</h3>
            <p className="text-gray-600 mb-6">Faça upload do seu primeiro PDF e transforme em estudo inteligente</p>
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Upload className="w-5 h-5 mr-2" />
                Começar Agora
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-4">
            {analyses.map((item) => {
              const r = item.result || {};
              const concepts = Array.isArray(r.keyConcepts) ? r.keyConcepts.length : 0;
              const cards = Array.isArray(r.flashcards) ? r.flashcards.length : 0;
              const quiz = Array.isArray(r.quiz) ? r.quiz.length : 0;
              const summary = typeof r.summary === "string" && r.summary.length > 0
                ? r.summary
                : "Resumo não disponível";

              const cleanName = item.file_name.replace(/\.pdf$/i, "");

              return (
                <Link
                  href={`/results/${item.id}`}
                  key={item.id}
                  className="group relative block transform-gpu transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:z-10"
                >
                  <div className="rounded-md border border-white/15 bg-white/80 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="p-2 flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-[hsl(var(--gradient-start)/0.2)] to-[hsl(var(--gradient-end)/0.2)] grid place-items-center flex-shrink-0">
                        <FileText className="w-2 h-2 text-gradient-animated" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="truncate text-[9px] font-medium text-gradient-animated leading-tight">{cleanName}</span>
                          <span className="text-[8px] text-muted-foreground leading-tight">{new Date(item.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <p className="text-[8px] text-muted-foreground line-clamp-2 leading-snug mt-0.5">{summary}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-px rounded-full bg-[hsl(var(--gradient-start)/0.08)] text-[8px] text-[hsl(var(--gradient-start))] leading-none">{concepts} C</span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-px rounded-full bg-[hsl(var(--gradient-end)/0.08)] text-[8px] text-[hsl(var(--gradient-end))] leading-none">{cards} F</span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-px rounded-full bg-[hsl(var(--primary)/0.08)] text-[8px] text-[hsl(var(--primary))] leading-none">{quiz} Q</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded bg-white/90 backdrop-blur shadow hover:bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}