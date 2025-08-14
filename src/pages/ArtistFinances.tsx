import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/Layout';
import { Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ArtistFinances = () => {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">финансы</h1>
          <p className="text-sm text-muted-foreground">управление вашими выплатами</p>
        </div>

        <Alert className="border-border/50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>пока недоступно, но уже совсем скоро</strong>
            <br />
            мы уже почти закончили работу над финансовым разделом. планируем запустить к 10 августа
          </AlertDescription>
        </Alert>

        <div className="p-6 border border-border/50 rounded-lg bg-card">
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">ваш баланс</h3>
            <p className="text-2xl font-semibold text-foreground">{profile?.balance_rub?.toFixed(2) || '0.00'} ₽</p>
          </div>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium">что будет доступно</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              функции которые появятся в разделе финансов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              <div className="space-y-1">
                <p className="font-medium text-sm">просмотр отчетов</p>
                <p className="text-sm text-muted-foreground">детальная статистика по всем платформам</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              <div className="space-y-1">
                <p className="font-medium text-sm">история выплат</p>
                <p className="text-sm text-muted-foreground">все предыдущие переводы и их статусы</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              <div className="space-y-1">
                <p className="font-medium text-sm">настройка выплат</p>
                <p className="text-sm text-muted-foreground">управление реквизитами</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ArtistFinances;