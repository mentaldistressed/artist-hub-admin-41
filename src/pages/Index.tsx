import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            добро пожаловать, {profile?.role === 'admin' ? profile.name : profile?.pseudonym}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile?.role === 'admin' ? 'панель администратора' : 'ваш личный кабинет'}
          </p>
        </div>
        
        {profile?.role === 'artist' ? (
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