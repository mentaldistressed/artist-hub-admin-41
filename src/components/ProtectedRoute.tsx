import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'artist' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();

  // Показываем загрузку только первые несколько секунд
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">загрузка...</p>
        </div>
      </div>
    );
  }

  // Если нет пользователя или профиля - показываем форму авторизации
  if (!user || !profile) {
    return <AuthForm />;
  }

  // Проверяем роль если требуется
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

  return <>{children}</>;
};

export default ProtectedRoute;