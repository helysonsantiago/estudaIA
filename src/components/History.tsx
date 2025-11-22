import { HistoryItem, getHistory, formatDate } from '@/lib/history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, ExternalLink, Sparkles, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface HistoryProps {
  onHistoryItemClick?: (item: HistoryItem) => void;
}

export function History({ onHistoryItemClick }: HistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const items = await getHistory();
    setHistory(items);
  };

  const handleItemClick = (item: HistoryItem) => {
    console.log('History item clicked:', item.id, item.fileName);
    if (onHistoryItemClick) {
      onHistoryItemClick(item);
    }
    // Não fazer nada aqui - deixar o Link componente lidar com a navegação
  };

  // Removido: opção de limpar/excluir histórico

  if (history.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/30">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum histórico ainda</h3>
          <p className="text-muted-foreground text-sm">
            Comece analisando seu primeiro documento para ver o histórico aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Histórico Recentemente Analisado</h3>
        </div>
        {/* Removido botão de limpar histórico */}
      </div>

      <div className="grid gap-3">
        {history.map((item, index) => (
          <Link 
            key={index} 
            href={`/results/${item.id}`}
            className="block"
          >
            <Card 
              className={cn(
                "group hover:shadow-md transition-all duration-200 cursor-pointer border-primary/10",
                "hover:border-primary/20 hover:bg-primary/5"
              )}
              onClick={() => handleItemClick(item)}
            >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.fileName}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ExternalLink className="h-3 w-3" />
                        <span>Visualizar</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}