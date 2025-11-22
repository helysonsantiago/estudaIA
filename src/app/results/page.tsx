"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModernLayout } from "@/components/ModernLayout";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Trash2,
  ChevronRight,
  Layers,
  BookOpen,
  Brain,
  Upload,
} from "lucide-react";

type AnalysisItem = {
  id: number;
  file_name: string;
  result: any;
  created_at: string;
};

export default function ResultsListPage() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analyses")
      .then((r) => r.json())
      .then((data) => setAnalyses(data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que quer apagar essa análise?")) return;
    await fetch(`/api/analyses?id=${id}`, { method: "DELETE" });
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <ModernLayout>
        <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 rounded-3xl gradient-animated flex items-center justify-center animate-pulse">
              <Upload className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gradient-animated">
              Carregando suas análises...
            </h2>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" className="rounded-2xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gradient-animated">
                Minhas análises
              </h1>
              <p className="text-muted-foreground mt-1">Acesse seus materiais analisados</p>
            </div>
          </div>
          <Link href="/">
            <Button size="lg" className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-glow">
              <Upload className="h-5 w-5 mr-2" />
              Novo Upload
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        {analyses.length === 0 ? (
          <div className="relative max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--gradient-start)/0.2)] via-[hsl(var(--gradient-end)/0.2)] to-[hsl(var(--primary)/0.2)] blur-3xl" />
            <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/30 p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[hsl(var(--gradient-start)/0.2)] to-[hsl(var(--gradient-end)/0.2)] flex items-center justify-center">
                <FileText className="h-12 w-12 text-gradient-animated" />
              </div>
              <h3 className="text-3xl font-bold text-gradient-animated mb-4">Nenhuma análise ainda</h3>
              <p className="text-lg text-muted-foreground mb-8">
                Comece agora transformando seus PDFs em flashcards, resumos e questões!
              </p>
              <Link href="/">
                <Button size="lg" className="rounded-2xl shadow-2xl hover:shadow-[hsl(var(--gradient-end)/0.5)] transition-all duration-300 bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]">
                  <Upload className="h-5 w-5 mr-2" />
                  Fazer Primeiro Upload
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {analyses.map((a) => {
              const r = a.result;
              const concepts = r?.keyConcepts?.length || 0;
              const cards = r?.flashcards?.length || 0;
              const quiz = r?.quiz?.length || 0;
              const summary = (r?.summary || "").slice(0, 60) + "...";

              return (
                <div key={a.id} className="rounded-md border border-white/15 bg-white/80 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="p-2 flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-[hsl(var(--gradient-start)/0.2)] to-[hsl(var(--gradient-end)/0.2)] grid place-items-center flex-shrink-0">
                      <FileText className="w-2 h-2 text-gradient-animated" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="truncate text-[10px] font-medium text-gradient-animated leading-tight">{a.file_name}</span>
                        <span className="text-[9px] text-muted-foreground leading-tight">{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground line-clamp-2 leading-snug mt-0.5">{summary}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-px rounded-full bg-[hsl(var(--gradient-start)/0.1)] text-[9px] text-[hsl(var(--gradient-start))] leading-none">
                          <Layers className="h-3 w-3" /> {concepts}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-px rounded-full bg-[hsl(var(--gradient-end)/0.1)] text-[9px] text-[hsl(var(--gradient-end))] leading-none">
                          <BookOpen className="h-3 w-3" /> {cards}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-px rounded-full bg-[hsl(var(--primary)/0.1)] text-[9px] text-[hsl(var(--primary))] leading-none">
                          <Brain className="h-3 w-3" /> {quiz}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/results/${a.id}`} className="inline-flex">
                        <Button size="sm" className="h-6 w-6 rounded-sm p-0 grid place-items-center bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]">
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-sm p-0 grid place-items-center hover:bg-destructive/10 text-destructive"
                        onClick={() => handleDelete(a.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModernLayout>
  );
}