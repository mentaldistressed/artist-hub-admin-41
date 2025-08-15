import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-premium">
            добро пожаловать
          </h1>
          <p className="text-base text-muted-foreground">
            {profile?.role === 'admin' ? 'панель администратора' : 'ваш личный кабинет'}
          </p>
        </div>
        
        {profile?.role === 'artist' ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div 
              className="group p-8 card-premium-interactive animate-slide-up"
              onClick={() => navigate('/finances')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-xl">₽</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">финансы</h3>
                <p className="text-muted-foreground">
                  управление балансом и выплатами
                </p>
              </div>
            </div>
            <div 
              className="group p-8 card-premium-interactive animate-slide-up"
              style={{ animationDelay: '0.1s' }}
              onClick={() => navigate('/reports')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">отчеты</h3>
                <p className="text-muted-foreground">
                  просмотр отчетов и заявки на выплаты
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div 
              className="group p-8 card-premium-interactive animate-slide-up"
              onClick={() => navigate('/admin-users')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-xl">👥</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">пользователи</h3>
                <p className="text-muted-foreground">
                  управление артистами и администраторами
                </p>
              </div>
            </div>
            <div 
              className="group p-8 card-premium-interactive animate-slide-up"
              style={{ animationDelay: '0.1s' }}
              onClick={() => navigate('/admin-finances')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">финансы</h3>
                <p className="text-muted-foreground">
                  контроль балансов и выплат
                </p>
              </div>
            </div>
            <div 
              className="group p-8 card-premium-interactive animate-slide-up"
              style={{ animationDelay: '0.2s' }}
              onClick={() => navigate('/admin-reports')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">отчеты</h3>
                <p className="text-muted-foreground">
                  управление отчетами артистов
                </p>
              </div>
            </div>
            <div 
              className="group p-8 card-premium-interactive animate-slide-up"
              style={{ animationDelay: '0.3s' }}
              onClick={() => navigate('/admin-payouts')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-xl">💸</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">выплаты</h3>
                <p className="text-muted-foreground">
                  обработка заявок на выплаты
                </p>
              </div>
            </div>
            <div 
              className="group p-8 card-premium-interactive animate-slide-up"
              style={{ animationDelay: '0.4s' }}
              onClick={() => navigate('/admin-settings')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-xl">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">настройки</h3>
                <p className="text-muted-foreground">
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