import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/Layout';
import { Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ArtistFinances = () => {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">финансы</h1>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>пока недоступно, но уже совсем скоро</strong>
            <br />
            мы уже почти закончили работу над финансовым разделом. планируем запустить к 10 августа
          </AlertDescription>
        </Alert>

                    <div className="p-6 border rounded-lg">
              <h3 className="font-semibold">ваш баланс</h3>
              <p className="text-2xl font-bold mt-2">{profile.balance_rub.toFixed(2)} ₽</p>
            </div>


        {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">текущий баланс</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">скоро</div>
              <p className="text-xs text-muted-foreground">рубли</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">доходы за месяц</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">скоро</div>
              <p className="text-xs text-muted-foreground">рубли</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">следующая выплата</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">скоро</div>
              <p className="text-xs text-muted-foreground">дата выплаты</p>
            </CardContent>
          </Card>
        </div> */}

        <Card>
          <CardHeader>
            <CardTitle>что будет доступно</CardTitle>
            <CardDescription>
              функции которые появятся в разделе финансов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">просмотр отчетов</p>
                <p className="text-sm text-muted-foreground">детальная статистика по всем платформам</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">история выплат</p>
                <p className="text-sm text-muted-foreground">все предыдущие переводы и их статусы</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">настройка выплат</p>
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