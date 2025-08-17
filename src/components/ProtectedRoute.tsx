import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

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
    user, 
    profile, 
    error,
    refreshProfile,
    clearError 
  } = useAuth();

  // Показываем загрузку только во время инициализации
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner 
          size="lg" 
          message="Инициализация приложения..." 
        />
      </div>
    );
  }

  // Если есть критическая ошибка
  if (error && error.includes('timeout')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Ошибка подключения
            </CardTitle>
            <CardDescription>
              Проблема с подключением к серверу
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="default" 
                size="sm"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Перезагрузить страницу
              </Button>
              
              <Button 
                onClick={clearError} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Продолжить без профиля
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Если нет пользователя, показываем форму входа
  if (!user) {
    return <AuthForm />;
  }

  // Если нет профиля, но есть пользователь, пытаемся загрузить профиль
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Загрузка профиля</CardTitle>
            <CardDescription>
              Настройка вашего аккаунта...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoadingSpinner size="md" message="загрузка данных профиля..." />
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={refreshProfile} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Повторить загрузку
              </Button>
              
              <Button 
                onClick={() => window.location.reload()} 
                variant="ghost" 
                size="sm"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Перезагрузить приложение
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Проверка ролей
  if (requiredRole && profile.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Доступ запрещен</CardTitle>
            <CardDescription>
              У Вас нет прав для просмотра этой страницы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              Назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Рендерим защищенный контент
  return <>{children}</>;
};