import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { Layout } from '@/components/Layout';

const Index = () => {
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

  if (!user || !profile) {
    return <AuthForm />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            добро пожаловать, {profile.role === 'admin' ? profile.name : profile.pseudonym}!
          </h1>
          <p className="text-muted-foreground">
            {profile.role === 'admin' ? 'панель администратора' : 'ваш личный кабинет артиста'}
          </p>
        </div>
        
        {profile.role === 'artist' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold">финансы</h3>
              <p className="text-sm text-muted-foreground mt-1">
                раздел финансов скоро откроется. планируем запуск к 10 августа
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold">пользователи</h3>
              <p className="text-sm text-muted-foreground mt-1">управление артистами и администраторами</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold">финансы</h3>
              <p className="text-sm text-muted-foreground mt-1">контроль балансов и выплат</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold">настройки</h3>
              <p className="text-sm text-muted-foreground mt-1">конфигурация системы</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;