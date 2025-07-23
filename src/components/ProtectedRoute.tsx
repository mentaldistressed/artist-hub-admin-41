import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'artist' | 'admin';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">загрузка...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, показываем форму входа
  if (!user || !profile) {
    return <AuthForm />;
  }

  // Если требуется определенная роль и у пользователя ее нет
  if (requiredRole && profile.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">доступ запрещен</h1>
          <p className="text-muted-foreground">у вас нет прав для доступа к этой странице</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};