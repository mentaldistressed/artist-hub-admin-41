import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, DollarSign, Send, Settings } from 'lucide-react';

const Index: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-premium">
            Добро пожаловать!
          </h1>
          <p className="text-base text-muted-foreground">
            {user?.role === 'admin' ? 'Панель администратора' : 'Ваш личный кабинет'}
          </p>
        </div>
        
        {user?.role === 'artist' ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div 
              className="group p-8 card-premium-interactive animate-slide-up cursor-pointer"
              style={{ animationDelay: '0.1s' }}
              onClick={() => navigate('/reports')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-200 group-hover:bg-muted/50">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">Мои отчёты</h3>
                <p className="text-muted-foreground">
                  Просмотр отчётов и заявки на выплаты
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div 
              className="group p-8 card-premium-interactive animate-slide-up cursor-pointer"
              onClick={() => navigate('/admin/users')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-200 group-hover:bg-muted/50">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">Пользователи</h3>
                <p className="text-muted-foreground">
                  Управление артистами и администраторами
                </p>
              </div>
            </div>
            <div 
              className="group p-8 card-premium-interactive animate-slide-up cursor-pointer"
              style={{ animationDelay: '0.2s' }}
              onClick={() => navigate('/admin/reports')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-200 group-hover:bg-muted/50">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">Отчёты</h3>
                <p className="text-muted-foreground">
                  Управление отчётами артистов
                </p>
              </div>
            </div>
            <div 
              className="group p-8 card-premium-interactive animate-slide-up cursor-pointer"
              style={{ animationDelay: '0.3s' }}
              onClick={() => navigate('/admin/payouts')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-200 group-hover:bg-muted/50">
                  <Send className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">Выплаты</h3>
                <p className="text-muted-foreground">
                  Обработка заявок на выплаты
                </p>
              </div>
            </div>
            <div 
              className="group p-8 card-premium-interactive animate-slide-up cursor-pointer"
              style={{ animationDelay: '0.4s' }}
              onClick={() => navigate('/admin/settings')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-200 group-hover:bg-muted/50">
                  <Settings className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground text-premium">Настройки</h3>
                <p className="text-muted-foreground">
                  Конфигурация системы
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