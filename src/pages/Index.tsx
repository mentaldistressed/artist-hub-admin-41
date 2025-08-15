import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Index render:', { user: !!user, profile: !!profile, loading });

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
    console.log('No user or profile in Index, showing auth form');
    return <AuthForm />;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            добро пожаловать, {profile.role === 'admin' ? profile.name : profile.pseudonym}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile.role === 'admin' ? 'панель администратора' : 'ваш личный кабинет'}
          </p>
        </div>
        
        {profile.role === 'artist' ? (
          <div className="grid gap-4">
            <div 
              className="p-6 border border-border/20 rounded-lg bg-card hover:border-border/40 transition-colors cursor-pointer"
              onClick={() => navigate('/finances')}
            >
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">финансы</h3>
                <p className="text-sm text-muted-foreground">
                  управление балансом и выплатами
                </p>
              </div>
            </div>
            <div 
              className="p-6 border border-border/20 rounded-lg bg-card hover:border-border/40 transition-colors cursor-pointer"
              onClick={() => navigate('/reports')}
            >
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">отчеты</h3>
                <p className="text-sm text-muted-foreground">
                  просмотр отчетов и заявки на выплаты
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div 
              className="p-6 border border-border/20 rounded-lg bg-card hover:border-border/40 transition-colors cursor-pointer"
              onClick={() => navigate('/admin-users')}
            >
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">пользователи</h3>
                <p className="text-sm text-muted-foreground">
                  управление артистами и администраторами
                </p>
              </div>
            </div>
            <div 
              className="p-6 border border-border/20 rounded-lg bg-card hover:border-border/40 transition-colors cursor-pointer"
              onClick={() => navigate('/admin-finances')}
            >
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">финансы</h3>
                <p className="text-sm text-muted-foreground">
                  контроль балансов и выплат
                </p>
              </div>
            </div>
            <div 
              className="p-6 border border-border/20 rounded-lg bg-card hover:border-border/40 transition-colors cursor-pointer"
              onClick={() => navigate('/admin-reports')}
            >
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">отчеты</h3>
                <p className="text-sm text-muted-foreground">
                  управление отчетами артистов
                </p>
              </div>
            </div>
            <div 
              className="p-6 border border-border/20 rounded-lg bg-card hover:border-border/40 transition-colors cursor-pointer"
              onClick={() => navigate('/admin-payouts')}
            >
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">выплаты</h3>
                <p className="text-sm text-muted-foreground">
                  обработка заявок на выплаты
                </p>
              </div>
            </div>
            <div 
              className="p-6 border border-border/20 rounded-lg bg-card hover:border-border/40 transition-colors cursor-pointer"
              onClick={() => navigate('/admin-settings')}
            >
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">настройки</h3>
                <p className="text-sm text-muted-foreground">
                  конфигурация системы
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;