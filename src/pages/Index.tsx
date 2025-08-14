import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { Layout } from '@/components/Layout';

const Index = () => {
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
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            добро пожаловать, {profile.role === 'admin' ? profile.name : profile.pseudonym}
          </h1>
          <p className="text-lg text-muted-foreground">
            {profile.role === 'admin' ? 'панель администратора' : 'ваш личный кабинет'}
          </p>
        </div>
        
        {profile.role === 'artist' ? (
          <div className="grid gap-6">
            <div className="p-8 glass-effect rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] group">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">финансы</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  раздел финансов скоро откроется. планируем запуск к 10 августа
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-8 glass-effect rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] group cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">👥</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">пользователи</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  управление артистами и администраторами
                </p>
              </div>
            </div>
            <div className="p-8 glass-effect rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] group cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">финансы</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  контроль балансов и выплат
                </p>
              </div>
            </div>
            <div className="p-8 glass-effect rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] group cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">⚙️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">настройки</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
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