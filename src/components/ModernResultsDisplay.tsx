'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Brain, 
  FileText, 
  Target, 
  Clock, 
  Copy, 
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Lightbulb,
  Zap,
  Trophy,
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AnalysisResult } from '@/types/analysis';

interface ModernResultsDisplayProps {
  result: AnalysisResult;
  onBack: () => void;
}

// Animation wrapper component
const AnimatedCard = ({ children, delay = 0, className = '' }: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transform transition-all duration-700 ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-8 opacity-0 scale-95'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export function ModernResultsDisplay({ result, onBack }: ModernResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [currentExam, setCurrentExam] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<number, any>>({});
  const [showExamResults, setShowExamResults] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const summary = result?.summary ?? '';
  const keyConcepts = result?.keyConcepts ?? [];
  const flashcards = result?.flashcards ?? [];
  const quizzes = result?.quiz ?? [];
  const studySchedule = result?.studySchedules ?? [];

  const examQuestions = useMemo(() => {
    const base = Array.isArray(quizzes) ? quizzes : [];
    const conceptEssays = (Array.isArray(keyConcepts) ? keyConcepts : []).map(kc => ({
      type: 'essay' as const,
      question: `Explique: ${kc.concept}`,
      explanation: kc.explanation,
    }));
    return [...base, ...conceptEssays];
  }, [quizzes, keyConcepts]);

  const handleCopyToAnki = async () => {
    const ankiFormat = flashcards.map(card => `${card.front}\t${card.back}`).join('\n');
    try {
      await navigator.clipboard.writeText(ankiFormat);
      setCopySuccess('anki');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Análise de Estudo - Resultados', 20, 30);
    
    // Resumo
    doc.setFontSize(16);
    doc.text('Resumo:', 20, 50);
    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(summary, 170);
    doc.text(summaryLines, 20, 60);
    
    // Conceitos-chave
    let yPosition = 90;
    if (keyConcepts && keyConcepts.length > 0) {
      doc.setFontSize(16);
      doc.text('Conceitos-chave:', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      keyConcepts.forEach((concept, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${index + 1}. ${concept}`, 20, yPosition);
        yPosition += 10;
      });
    }
    
    // Flashcards
    if (flashcards.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(16);
      doc.text('Flashcards:', 20, yPosition);
      yPosition += 10;
      
      flashcards.forEach((card, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(12);
        doc.text(`Q: ${card.question}`, 20, yPosition);
        yPosition += 10;
        doc.text(`A: ${card.answer}`, 20, yPosition);
        yPosition += 15;
      });
    }
    
    doc.save('analise-estudo.pdf');
  };

  const getQuizScore = () => {
    const correct = Object.entries(quizAnswers).filter(([index, answer]) => {
      const quizIndex = parseInt(index);
      const quiz = quizzes[quizIndex];
      if (!quiz || quiz.correctAnswer === undefined) return false;
      if (quiz.type === 'true_false') {
        const mapped = answer === 'Verdadeiro' ? true : answer === 'Falso' ? false : answer;
        return mapped === quiz.correctAnswer;
      }
      return quiz.correctAnswer === answer;
    }).length;
    const totalAuto = quizzes.filter(q => q.correctAnswer !== undefined).length;
    return { correct, total: totalAuto };
  };

  const nextFlashcard = () => {
    setShowFlashcardAnswer(false);
    setCurrentFlashcard((prev) => (prev + 1) % flashcards.length);
  };

  const prevFlashcard = () => {
    setShowFlashcardAnswer(false);
    setCurrentFlashcard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const nextQuiz = () => {
    if (currentQuiz < quizzes.length - 1) {
      setCurrentQuiz((prev) => prev + 1);
    } else {
      setShowQuizResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(0);
    setQuizAnswers({});
    setShowQuizResults(false);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header with animation */}
      <div className={`bg-white border-b border-slate-200 transform transition-all duration-500 ${
        isMounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-slate-100 transition-all duration-200"
              >
                ← Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gradient-animated">Análise</h1>
                <p className="text-muted-foreground">Resultados do seu material</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToAnki}
                className="border-slate-300 hover:bg-slate-50 transition-all duration-200"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copySuccess === 'anki' ? 'Copiado!' : 'Copiar p/ Anki'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="border-slate-300 hover:bg-slate-50 transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards with staggered animation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AnimatedCard delay={1}>
            <Card className="border-primary/10 bg-white">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg transform transition-transform hover:scale-110">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Resumo</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {summary.split(' ').length}
                    </p>
                    <p className="text-xs text-blue-500">palavras</p>
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={2}>
            <Card className="border-primary/10 bg-white">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500 rounded-lg transform transition-transform hover:scale-110">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Flashcards</p>
                    <p className="text-2xl font-bold text-green-900">
                      {flashcards.length}
                    </p>
                    <p className="text-xs text-green-500">cartões</p>
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={3}>
            <Card className="border-primary/10 bg-white">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500 rounded-lg transform transition-transform hover:scale-110">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Quizzes</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {quizzes.length}
                    </p>
                    <p className="text-xs text-purple-500">perguntas</p>
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={4}>
            <Card className="border-primary/10 bg-white">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-500 rounded-lg transform transition-transform hover:scale-110">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">Cronograma</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {studySchedule.length}
                    </p>
                    <p className="text-xs text-orange-500">sessões</p>
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedCard>
        </div>

        {/* Main Content with animation */}
        <AnimatedCard delay={5}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[500px] p-1 rounded-full glass-card">
              <TabsTrigger 
                value="overview" 
                className="pill-trigger flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger 
                value="concepts" 
                className="pill-trigger flex items-center space-x-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Conceitos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="practice" 
                className="pill-trigger flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Prática</span>
              </TabsTrigger>
              <TabsTrigger 
                value="schedule" 
                className="pill-trigger flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Cronograma</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Progress Panel */}
              {showProgress && (
                <AnimatedCard delay={0}>
                <Card className="mb-6 glass-card">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Seu Avanço</h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setActiveTab('exam'); setExamStarted(true); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Prova Simulada
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowProgress(p => !p)}
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            Ocultar
                          </Button>
                        </div>
                      </div>
                      {(() => {
                        const quizCorrect = Object.entries(quizAnswers).filter(([index, answer]) => {
                          const qi = parseInt(index);
                          const q = quizzes[qi];
                          if (!q || q.correctAnswer === undefined) return false;
                          if (q.type === 'true_false') {
                            const mapped = answer === 'Verdadeiro' ? true : answer === 'Falso' ? false : answer;
                            return mapped === q.correctAnswer;
                          }
                          return q.correctAnswer === answer;
                        }).length;
                        const quizTotal = quizzes.filter(q => q.correctAnswer !== undefined).length;
                        const examCorrect = Object.entries(examAnswers).filter(([index, answer]) => {
                          const ei = parseInt(index);
                          const q = examQuestions[ei];
                          if (!q || (q as any).correctAnswer === undefined) return false;
                          if (q.type === 'true_false') {
                            const mapped = answer === 'Verdadeiro' ? true : answer === 'Falso' ? false : answer;
                            return mapped === (q as any).correctAnswer;
                          }
                          return (q as any).correctAnswer === answer;
                        }).length;
                        const examTotal = examQuestions.filter((q: any) => q.correctAnswer !== undefined).length;
                        const quizPct = quizTotal ? (quizCorrect / quizTotal) : 0;
                        const examPct = examTotal ? (examCorrect / examTotal) : 0;
                        const learning = Math.round((examTotal ? 0.6 * examPct : 0) + (quizTotal ? 0.4 * quizPct : 0)) * 100;
                        const wrongQuestions: string[] = [];
                        quizzes.forEach((q, i) => {
                          const ans = quizAnswers[i];
                          if (ans === undefined) return;
                          if (q.correctAnswer === undefined) return;
                          let ok = q.correctAnswer === ans;
                          if (q.type === 'true_false') {
                            const mapped = ans === 'Verdadeiro' ? true : ans === 'Falso' ? false : ans;
                            ok = mapped === q.correctAnswer;
                          }
                          if (!ok) wrongQuestions.push(q.question);
                        });
                        examQuestions.forEach((q: any, i: number) => {
                          const ans = examAnswers[i];
                          if (ans === undefined) return;
                          if (q.correctAnswer === undefined) return;
                          let ok = q.correctAnswer === ans;
                          if (q.type === 'true_false') {
                            const mapped = ans === 'Verdadeiro' ? true : ans === 'Falso' ? false : ans;
                            ok = mapped === q.correctAnswer;
                          }
                          if (!ok) wrongQuestions.push(q.question);
                        });
                        const topics: string[] = [];
                        const concepts = keyConcepts.map(k => k.concept.toLowerCase());
                        wrongQuestions.forEach(wq => {
                          const lwq = wq.toLowerCase();
                          const match = concepts.find(c => lwq.includes(c));
                          if (match) topics.push(match);
                        });
                        const uniqueTopics = Array.from(new Set(topics));
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-slate-600">Progresso estimado</p>
                                <p className="text-3xl font-bold text-slate-900">{learning}%</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-slate-600">Quiz: {Math.round(quizPct * 100)}%</p>
                                <p className="text-sm text-slate-600">Prova: {Math.round(examPct * 100)}%</p>
                              </div>
                            </div>
                            {uniqueTopics.length > 0 ? (
                              <div>
                                <p className="text-slate-700 font-medium mb-2">Tópicos para revisar</p>
                                <div className="flex flex-wrap gap-2">
                                  {uniqueTopics.map((t, i) => (
                                    <Badge key={i} variant="outline" className="border-slate-300">{t}</Badge>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-600">Sem tópicos críticos a revisar até agora.</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </Card>
                </AnimatedCard>
              )}
              {/* Summary Section */}
              <AnimatedCard delay={6}>
                <Card className="glass-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-blue-500 animate-pulse" />
                        Resumo Executivo
                      </h3>
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                        IA Gerado
                      </Badge>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed text-lg">
                        {summary}
                      </p>
                    </div>
                  </div>
                </Card>
              </AnimatedCard>

              {/* Key Concepts */}
              {keyConcepts && keyConcepts.length > 0 && (
                <AnimatedCard delay={7}>
                  <Card className="glass-card">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-green-500" />
                        Conceitos-Chave
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {keyConcepts.map((kc, index) => (
                          <div 
                            key={index} 
                            className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-200"
                          >
                            <div className="flex items-center mb-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                <span className="text-green-600 text-sm font-semibold">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="text-slate-900 font-semibold">
                                {kc.concept}
                              </span>
                            </div>
                            <p className="text-slate-700 text-sm">
                              {kc.explanation}
                            </p>
                            {kc.example && (
                              <p className="text-slate-600 text-sm mt-2">
                                Exemplo: {kc.example}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </AnimatedCard>
              )}

              {/* Flashcards Section - Below Summary as requested */}
              {flashcards.length > 0 && (
                <AnimatedCard delay={8}>
                  <Card className="glass-card">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                          <Brain className="w-5 h-5 mr-2 text-green-500" />
                          Flashcards de Estudo
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                            {currentFlashcard + 1} / {flashcards.length}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                            className="hover:bg-green-100 transition-all duration-200"
                          >
                            {showFlashcardAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 transform transition-all duration-300 hover:shadow-md">
                      {flashcards[currentFlashcard] && (
                        <div className="space-y-4">
                          <div className="text-center">
                            <h4 className="text-lg font-semibold text-slate-900 mb-2">
                              Pergunta:
                            </h4>
                            <p className="text-slate-700 text-lg leading-relaxed">
                              {flashcards[currentFlashcard].front}
                            </p>
                          </div>
                          
                          {showFlashcardAnswer && (
                            <div className="border-t border-green-200 pt-4 transform transition-all duration-300">
                              <h4 className="text-lg font-semibold text-green-700 mb-2">
                                Resposta:
                              </h4>
                              <p className="text-slate-700 leading-relaxed">
                                {flashcards[currentFlashcard].back}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevFlashcard}
                          className="border-green-300 hover:bg-green-50 transition-all duration-200"
                        >
                          ← Anterior
                        </Button>
                        <div className="flex space-x-2">
                          {flashcards.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setCurrentFlashcard(index);
                                setShowFlashcardAnswer(false);
                              }}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                index === currentFlashcard
                                  ? 'bg-green-500 scale-125'
                                  : 'bg-green-200 hover:bg-green-300'
                              }`}
                            />
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextFlashcard}
                          className="border-green-300 hover:bg-green-50 transition-all duration-200"
                        >
                          Próximo →
                        </Button>
                      </div>
                    </div>
                  </Card>
                </AnimatedCard>
              )}
            </TabsContent>

            {/* Concepts Tab */}
            <TabsContent value="concepts" className="space-y-6">
            {keyConcepts && keyConcepts.length > 0 && (
              <div className="grid gap-4">
                  {keyConcepts.map((kc, index) => (
                    <AnimatedCard key={index} delay={index + 6}>
                      <Card className="border-primary/10 bg-white">
                        <div className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-slate-900 mb-1">
                                {kc.concept}
                              </h4>
                              <p className="text-slate-600">
                                {kc.explanation}
                              </p>
                              {kc.details && (
                                <p className="text-slate-600 mt-2 text-sm">
                                  {kc.details}
                                </p>
                              )}
                              {kc.formula && (
                                <p className="text-slate-700 mt-2 text-sm">
                                  Fórmula: {kc.formula}
                                </p>
                              )}
                              {kc.values && kc.values.length > 0 && (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {kc.values.map((v, vi) => (
                                    <div key={vi} className="text-xs text-slate-500">
                                      {v.label}: {v.formatted ?? v.value ?? v.valueNumber}
                                      {v.unitSymbol ? ` ${v.unitSymbol}` : ''}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </AnimatedCard>
                  ))}
              </div>
            )}
            </TabsContent>

            {/* Practice Tab */}
            <TabsContent value="practice" className="space-y-6">
              {/* Progress Panel inside Practice */}
              {showProgress && (
                <AnimatedCard delay={0}>
                  <Card className="mb-6 border-primary/10 bg-white">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Seu Avanço</h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setActiveTab('exam'); setExamStarted(true); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Prova Simulada
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowProgress(p => !p)}
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            Ocultar
                          </Button>
                        </div>
                      </div>
                      {(() => {
                        const quizCorrect = Object.entries(quizAnswers).filter(([index, answer]) => {
                          const qi = parseInt(index);
                          const q = quizzes[qi];
                          if (!q || q.correctAnswer === undefined) return false;
                          if (q.type === 'true_false') {
                            const mapped = answer === 'Verdadeiro' ? true : answer === 'Falso' ? false : answer;
                            return mapped === q.correctAnswer;
                          }
                          return q.correctAnswer === answer;
                        }).length;
                        const quizTotal = quizzes.filter(q => q.correctAnswer !== undefined).length;
                        const examCorrect = Object.entries(examAnswers).filter(([index, answer]) => {
                          const ei = parseInt(index);
                          const q = examQuestions[ei];
                          if (!q || (q as any).correctAnswer === undefined) return false;
                          if (q.type === 'true_false') {
                            const mapped = answer === 'Verdadeiro' ? true : answer === 'Falso' ? false : answer;
                            return mapped === (q as any).correctAnswer;
                          }
                          return (q as any).correctAnswer === answer;
                        }).length;
                        const examTotal = examQuestions.filter((q: any) => q.correctAnswer !== undefined).length;
                        const quizPct = quizTotal ? (quizCorrect / quizTotal) : 0;
                        const examPct = examTotal ? (examCorrect / examTotal) : 0;
                        const learning = Math.round((examTotal ? 0.6 * examPct : 0) + (quizTotal ? 0.4 * quizPct : 0)) * 100;
                        const wrongQuestions: string[] = [];
                        quizzes.forEach((q, i) => {
                          const ans = quizAnswers[i];
                          if (ans === undefined) return;
                          if (q.correctAnswer === undefined) return;
                          let ok = q.correctAnswer === ans;
                          if (q.type === 'true_false') {
                            const mapped = ans === 'Verdadeiro' ? true : ans === 'Falso' ? false : ans;
                            ok = mapped === q.correctAnswer;
                          }
                          if (!ok) wrongQuestions.push(q.question);
                        });
                        examQuestions.forEach((q: any, i: number) => {
                          const ans = examAnswers[i];
                          if (ans === undefined) return;
                          if (q.correctAnswer === undefined) return;
                          let ok = q.correctAnswer === ans;
                          if (q.type === 'true_false') {
                            const mapped = ans === 'Verdadeiro' ? true : ans === 'Falso' ? false : ans;
                            ok = mapped === q.correctAnswer;
                          }
                          if (!ok) wrongQuestions.push(q.question);
                        });
                        const topics: string[] = [];
                        const concepts = keyConcepts.map(k => k.concept.toLowerCase());
                        wrongQuestions.forEach(wq => {
                          const lwq = wq.toLowerCase();
                          const match = concepts.find(c => lwq.includes(c));
                          if (match) topics.push(match);
                        });
                        const uniqueTopics = Array.from(new Set(topics));
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-slate-600">Progresso estimado</p>
                                <p className="text-3xl font-bold text-slate-900">{learning}%</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-slate-600">Quiz: {Math.round(quizPct * 100)}%</p>
                                <p className="text-sm text-slate-600">Prova: {Math.round(examPct * 100)}%</p>
                              </div>
                            </div>
                            {uniqueTopics.length > 0 ? (
                              <div>
                                <p className="text-slate-700 font-medium mb-2">Tópicos para revisar</p>
                                <div className="flex flex-wrap gap-2">
                                  {uniqueTopics.map((t, i) => (
                                    <Badge key={i} variant="outline" className="border-slate-300">{t}</Badge>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-600">Sem tópicos críticos a revisar até agora.</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </Card>
                </AnimatedCard>
              )}
              {quizzes.length > 0 && (
                <AnimatedCard delay={6}>
                  <Card className="border-primary/10 bg-white">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                          <Trophy className="w-5 h-5 mr-2 text-purple-500" />
                          Quiz de Prática
                        </h3>
                        <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                          {currentQuiz + 1} / {quizzes.length}
                        </Badge>
                      </div>

                      {!showQuizResults ? (
                        <div className="space-y-6">
                          {quizzes[currentQuiz] && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200 transform transition-all duration-300 hover:shadow-md">
                              <h4 className="text-lg font-semibold text-slate-900 mb-4">
                                {quizzes[currentQuiz].question}
                              </h4>
                              {(() => {
                                const q = quizzes[currentQuiz];
                                const opts = q.options ?? (q.type === 'true_false' ? ['Verdadeiro', 'Falso'] : []);
                                if (opts.length > 0) {
                                  return (
                                    <div className="space-y-3">
                                      {opts.map((option, index) => (
                                        <label
                                          key={index}
                                          className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all duration-200 transform hover:scale-102"
                                        >
                                          <input
                                            type="radio"
                                            name={`quiz-${currentQuiz}`}
                                            value={option}
                                            checked={quizAnswers[currentQuiz] === option}
                                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, [currentQuiz]: e.target.value }))}
                                            className="w-4 h-4 text-purple-600"
                                          />
                                          <span className="text-slate-700">{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                  );
                                }
                                return (
                                  <div className="space-y-3">
                                    <p className="text-slate-600 text-sm">
                                      Responda em formato livre. Esta pergunta não possui avaliação automática.
                                    </p>
                                    <textarea
                                      className="w-full p-3 rounded-md border border-slate-200 bg-transparent"
                                      rows={4}
                                      placeholder="Sua resposta..."
                                      onChange={(e) => setQuizAnswers(prev => ({ ...prev, [currentQuiz]: e.target.value }))}
                                    />
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          <div className="flex justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab('schedule')}
                            className="border-purple-300 hover:bg-purple-50 transition-all duration-200"
                            >
                              Pular Quiz
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={nextQuiz}
                              disabled={quizAnswers[currentQuiz] === undefined}
                              className="bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105"
                            >
                              {currentQuiz === quizzes.length - 1 ? 'Finalizar' : 'Próxima'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-6">
                          <div className="bg-white rounded-xl p-8 shadow-sm border border-purple-200">
                            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
                            <h4 className="text-2xl font-bold text-slate-900 mb-2">
                              Quiz Finalizado!
                            </h4>
                            <div className="text-4xl font-bold text-purple-600 mb-2">
                              {getQuizScore().correct}/{getQuizScore().total}
                            </div>
                            <p className="text-slate-600 mb-6">
                              Você acertou {getQuizScore().correct} de {getQuizScore().total} perguntas
                            </p>
                            <div className="flex justify-center space-x-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={resetQuiz}
                                className="border-purple-300 hover:bg-purple-50 transition-all duration-200"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refazer Quiz
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setActiveTab('schedule')}
                                className="bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105"
                              >
                                Ver Cronograma
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </AnimatedCard>
              )}
            </TabsContent>

            {/* Exam Tab */}
            <TabsContent value="exam" className="space-y-6">
              {examQuestions.length > 0 && (
                <AnimatedCard delay={6}>
                  <Card className="border-primary/10 bg-white">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                          Prova Simulada
                        </h3>
                        <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                          {currentExam + 1} / {examQuestions.length}
                        </Badge>
                      </div>
                      {!showExamResults ? (
                        <div className="space-y-6">
                          {!examStarted ? (
                            <div className="text-center">
                              <p className="text-slate-600 mb-4">A prova reúne todas as questões disponíveis e redações sobre conceitos.</p>
                              <Button variant="default" size="sm" onClick={() => setExamStarted(true)} className="bg-indigo-600 hover:bg-indigo-700">
                                Iniciar Prova
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-200">
                                <h4 className="text-lg font-semibold text-slate-900 mb-4">
                                  {examQuestions[currentExam]?.question}
                                </h4>
                                {(() => {
                                  const q: any = examQuestions[currentExam];
                                  const opts = q?.options ?? (q?.type === 'true_false' ? ['Verdadeiro', 'Falso'] : []);
                                  if (opts.length > 0) {
                                    return (
                                      <div className="space-y-3">
                                        {opts.map((option: string, index: number) => (
                                          <label
                                            key={index}
                                            className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all duration-200"
                                          >
                                            <input
                                              type="radio"
                                              name={`exam-${currentExam}`}
                                              value={option}
                                              checked={examAnswers[currentExam] === option}
                                              onChange={(e) => setExamAnswers(prev => ({ ...prev, [currentExam]: e.target.value }))}
                                              className="w-4 h-4 text-indigo-600"
                                            />
                                            <span className="text-slate-700">{option}</span>
                                          </label>
                                        ))}
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="space-y-3">
                                      <textarea
                                        className="w-full p-3 rounded-md border border-slate-200 bg-transparent"
                                        rows={5}
                                        placeholder="Escreva sua resposta..."
                                        onChange={(e) => setExamAnswers(prev => ({ ...prev, [currentExam]: e.target.value }))}
                                      />
                                    </div>
                                  );
                                })()}
                              </div>
                              <div className="flex justify-between">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setActiveTab('practice')}
                                  className="border-indigo-300"
                                >
                                  Pular Prova
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    if (currentExam < examQuestions.length - 1) {
                                      setCurrentExam(c => c + 1);
                                    } else {
                                      setShowExamResults(true);
                                    }
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                  {currentExam === examQuestions.length - 1 ? 'Finalizar' : 'Próxima'}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-center space-y-6">
                          <div className="bg-white rounded-xl p-8 shadow-sm border border-indigo-200">
                            <h4 className="text-2xl font-bold text-slate-900 mb-2">Prova Finalizada!</h4>
                            {(() => {
                              const correct = Object.entries(examAnswers).filter(([index, answer]) => {
                                const ei = parseInt(index);
                                const q: any = examQuestions[ei];
                                if (!q || q.correctAnswer === undefined) return false;
                                if (q.type === 'true_false') {
                                  const mapped = answer === 'Verdadeiro' ? true : answer === 'Falso' ? false : answer;
                                  return mapped === q.correctAnswer;
                                }
                                return q.correctAnswer === answer;
                              }).length;
                              const total = examQuestions.filter((q: any) => q.correctAnswer !== undefined).length;
                              return (
                                <>
                                  <div className="text-4xl font-bold text-indigo-600 mb-2">{correct}/{total}</div>
                                  <p className="text-slate-600 mb-6">Você acertou {correct} de {total} questões objetivas</p>
                                </>
                              );
                            })()}
                            <div className="flex justify-center space-x-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setExamStarted(false); setCurrentExam(0); setExamAnswers({}); setShowExamResults(false); }}
                                className="border-indigo-300"
                              >
                                Refazer Prova
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setActiveTab('overview')}
                                className="bg-indigo-600 hover:bg-indigo-700"
                              >
                                Ver Resumo
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </AnimatedCard>
              )}
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6">
            {studySchedule.length > 0 && (
              <AnimatedCard delay={6}>
                <Card className="border-primary/10 bg-white">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-orange-500" />
                      Cronograma de Estudos
                    </h3>
                    <div className="space-y-4">
                        {studySchedule.map((session, index) => (
                          <div 
                            key={index} 
                            className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-200 transform hover:scale-102"
                          >
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-semibold">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">
                                {session.type.toUpperCase()} • {session.duration}
                              </h4>
                              <p className="text-sm text-slate-600">
                                {session.description}
                              </p>
                              {session.activities && session.activities.length > 0 && (
                                <ul className="mt-2 list-disc list-inside text-xs text-slate-600">
                                  {session.activities.map((a, ai) => (
                                    <li key={ai}>{a}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>
                </Card>
              </AnimatedCard>
            )}
            </TabsContent>
          </Tabs>
        </AnimatedCard>
      </div>
    </div>
  );
}