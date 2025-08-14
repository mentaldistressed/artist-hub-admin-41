import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { profile } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border/50 bg-background px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center">
              <h1 className="text-sm font-medium text-foreground">
                rplus
              </h1>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {profile?.role === 'admin' ? 'администратор' : 'артист'}
              </span>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};