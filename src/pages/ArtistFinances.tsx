import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/Layout';
import { Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ArtistFinances = () => {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">финансы</h1>
          <p className="text-lg text-muted-foreground">управление вашими выплатами</p>
        </div>

        <Alert className="glass-effect border-0 shadow-lg rounded-2xl p-6">
          <Info className="h-5 w-5 text-primary" />
          <AlertDescription className="text-base leading-relaxed">
            <strong>пока недоступно, но уже совсем скоро</strong>
            <br />
            мы уже почти закончили работу над финансовым разделом. планируем запустить к 10 августа
          </AlertDescription>
        </Alert>

        <div className="p-8 glass-effect rounded-2xl shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">ваш баланс</h3>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {profile?.balance_rub?.toFixed(2) || '0.00'} ₽
            </p>
          </div>
        </div>

        <Card className="glass-effect border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">что будет доступно</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              функции которые появятся в разделе финансов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full mt-2"></div>
              <div className="space-y-2">
                <p className="font-semibold text-lg">просмотр отчетов</p>
                <p className="text-muted-foreground leading-relaxed">детальная статистика по всем платформам</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full mt-2"></div>
              <div className="space-y-2">
                <p className="font-semibold text-lg">история выплат</p>
                <p className="text-muted-foreground leading-relaxed">все предыдущие переводы и их статусы</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full mt-2"></div>
              <div className="space-y-2">
                <p className="font-semibold text-lg">настройка выплат</p>
                <p className="text-muted-foreground leading-relaxed">управление реквизитами</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ArtistFinances;