import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b border-border/30 bg-background/80 backdrop-blur-xl px-6 premium-shadow">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">R</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                rplus
              </h1>
            </div>
          </header>
          
          <main className="flex-1 p-8 bg-transparent">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};