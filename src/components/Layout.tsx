import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-muted-foreground">загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthForm />;
  }

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