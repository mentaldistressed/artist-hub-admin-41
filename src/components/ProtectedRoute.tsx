import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'artist' | 'admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  console.log('ProtectedRoute render:', { user: !!user, profile: !!profile, loading });

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
    console.log('No user or profile, showing auth form');
    return <AuthForm />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-medium text-foreground">доступ запрещен</h1>
          <p className="text-muted-foreground">у вас нет прав для просмотра этой страницы</p>
        </div>
      </div>
    );
  }

  console.log('User authenticated, showing protected content');
  return <>{children}</>;
};

export default ProtectedRoute;