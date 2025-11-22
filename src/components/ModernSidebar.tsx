'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Settings, 
  FileText, 
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Início', href: '/', icon: Home },
  { name: 'Análises', href: '/results', icon: FileText },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function ModernSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Botão mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card shadow-lg border border-border"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card/40 backdrop-blur-xl border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header da Sidebar */}
        <div className="flex items-center justify-center h-16 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] animate-gradient glow-soft">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient-animated">EstudaIA</span>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  console.log('Sidebar navigation clicked:', item.href);
                  setIsOpen(false);
                }}
                className={cn(
                  "group flex items-center space-x-3 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200",
                  active
                    ? "text-white bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] shadow-lg"
                    : "text-muted-foreground hover:bg-primary/10"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer da Sidebar */}
        <div className="p-4 border-t border-border">
          {/* Status */}
          <div className="bg-secondary rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">IA Conectada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Espaço reservado para a sidebar em desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}