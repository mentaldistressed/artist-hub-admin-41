import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/Layout';
import { Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Releases = () => {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Релизы</h1>
          {/* <p className="text-sm text-muted-foreground">управление вашими выплатами</p> */}
        </div>

        <Alert className="border-border/50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Раздел в разработке</strong>
            <br />
            Мы работаем над этим разделом. Планируем запустить его в следующем месяце
          </AlertDescription>
        </Alert>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Что будет доступно</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Функции, которые появятся в разделе финансов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              <div className="space-y-1">
                <p className="font-medium text-sm">Пока не покажем...</p>
                <p className="text-sm text-muted-foreground">Но совсем скоро отобразим здесь</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Releases;