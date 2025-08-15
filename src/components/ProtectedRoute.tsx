import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'artist' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { 
    isLoading, 
    isInitialized, 
    isAuthenticated, 
    user, 
    profile, 
    error,
    clearError 
  } = useAuth();

  // Show loading spinner during initialization
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner 
          size="lg" 
          message="инициализация приложения..." 
        />
      </div>
    );
  }

  // Show error state if there's an authentication error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">ошибка авторизации</CardTitle>
            <CardDescription>
              не удалось загрузить данные пользователя
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button onClick={clearError} variant="outline" size="sm">
                попробовать снова
              </Button>
              <Button onClick={() => window.location.reload()} size="sm">
                перезагрузить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated || !user || !profile) {
    return <AuthForm />;
  }

  // Check role permissions
  if (requiredRole && profile.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>доступ запрещен</CardTitle>
            <CardDescription>
              у вас нет прав для просмотра этой страницы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              требуется роль: {requiredRole === 'admin' ? 'администратор' : 'артист'}
            </p>
            <p className="text-sm text-muted-foreground">
              ваша роль: {profile.role === 'admin' ? 'администратор' : 'артист'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};