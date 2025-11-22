'use client';

import { ModernSidebar } from '@/components/ModernSidebar';
import { cn } from '@/lib/utils';

interface ModernLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ModernLayout({ children, className }: ModernLayoutProps) {
  return (
    <div className="min-h-screen bg-white relative">
      <ModernSidebar />
      <main className={cn("lg:ml-64 transition-all duration-300 pt-16 lg:pt-0", className)}>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}