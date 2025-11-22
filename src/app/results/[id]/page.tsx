"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ModernResultsDisplay } from "@/components/ModernResultsDisplay";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Calendar } from "lucide-react";
import { ModernLayout } from "@/components/ModernLayout";

type AnalysisItem = {
  id: number;
  file_name: string;
  result: any;
  created_at: string;
};

export default function ResultDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const numericId = Number(idParam);

  const [analysis, setAnalysis] = useState<AnalysisItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const hasCelebratedRef = useRef(false);

  useEffect(() => {
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      setError("ID inválido");
      setLoading(false);
      return;
    }

    fetch(`/api/analyses?id=${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setAnalysis(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar análise");
      })
      .finally(() => setLoading(false));
  }, [idParam]);

  useEffect(() => {
    if (!loading && analysis) {
      if (!hasCelebratedRef.current) {
        const key = `celebrated:${numericId}`;
        const already = typeof window !== 'undefined' ? sessionStorage.getItem(key) === '1' : false;
        if (!already) {
          hasCelebratedRef.current = true;
          if (typeof window !== 'undefined') sessionStorage.setItem(key, '1');
          setShowCelebration(true);
          const t = setTimeout(() => setShowCelebration(false), 2500);
          return () => clearTimeout(t);
        } else {
          hasCelebratedRef.current = true;
          setShowCelebration(false);
        }
      }
    }
  }, [loading, analysis, numericId]);

  if (loading) {
    return (
      <ModernLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center animate-pulse">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gradient-animated">
              Carregando análise...
            </h2>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (error || !analysis) {
    return (
      <ModernLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link href="/results">
              <Button variant="ghost" className="rounded-2xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <div className="rounded-3xl border border-white/30 bg-white/80 backdrop-blur-2xl p-10 text-center">
            <h1 className="text-2xl font-semibold">{error ? "Falha ao carregar análise" : "Análise não encontrada"}</h1>
            <p className="text-muted-foreground mt-2">Tente novamente ou volte para a lista.</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      {showCelebration && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0">
            {Array.from({ length: 200 }).map((_, i) => {
              const left = Math.random() * 100;
              const delay = Math.random() * 0.6;
              const duration = 2 + Math.random() * 1.8;
              const size = 3 + Math.random() * 7;
              const shapes = ["0px", "50%", "2px"];
              const shape = shapes[i % shapes.length];
              const colors = [
                'hsl(var(--gradient-start))',
                'hsl(var(--gradient-end))',
                'hsl(var(--primary))',
                'hsl(200 90% 60%)',
                'hsl(320 85% 62%)',
                'hsl(145 60% 45%)',
                'hsl(35 90% 55%)',
              ];
              const color = colors[i % colors.length];
              return (
                <span
                  key={i}
                  className="absolute"
                  style={{
                    left: `${left}%`,
                    top: `-10px`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    borderRadius: shape,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animation: `celebrate-fall ${duration}s ease-in ${delay}s forwards`,
                  }}
                />
              );
            })}
          </div>
          <div className="absolute bottom-[-20px] left-0 right-0">
            {[
              { left: '8%', w: 40, h: 60, color: 'hsl(var(--gradient-start))', delay: 0 },
              { left: '25%', w: 50, h: 75, color: 'hsl(320 85% 62%)', delay: 0.1 },
              { left: '42%', w: 45, h: 70, color: 'hsl(var(--primary))', delay: 0.2 },
              { left: '60%', w: 55, h: 85, color: 'hsl(200 90% 60%)', delay: 0.05 },
              { left: '80%', w: 48, h: 72, color: 'hsl(35 90% 55%)', delay: 0.15 },
            ].map((b, idx) => (
              <div
                key={idx}
                className="absolute rounded-full"
                style={{
                  left: b.left,
                  width: `${b.w}px`,
                  height: `${b.h}px`,
                  backgroundColor: b.color,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  animation: `celebrate-rise ${2.6 + idx * 0.3}s ease-out ${b.delay}s, celebrate-balloon-sway 3s ease-in-out ${b.delay}s infinite alternate`,
                }}
              >
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-transparent" />
              </div>
            ))}
          </div>
          <style>{`
            @keyframes celebrate-fall {
              0% { top: -10px; opacity: 1; }
              100% { top: 100vh; opacity: 0; }
            }
            @keyframes celebrate-rise {
              0% { transform: translateY(0); opacity: 0; }
              100% { transform: translateY(-70vh); opacity: 1; }
            }
            @keyframes celebrate-balloon-sway {
              0% { margin-left: -12px; }
              100% { margin-left: 12px; }
            }
          `}</style>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-animated">{analysis.file_name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(analysis.created_at || Date.now()).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <ModernResultsDisplay
          result={analysis.result}
          onBack={() => router.push('/results')}
        />
      </div>
    </ModernLayout>
  );
}