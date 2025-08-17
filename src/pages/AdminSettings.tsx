import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/Layout';
import { Settings } from 'lucide-react';

const AdminSettings = () => {
  return (
    <Layout>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">настройки</h1>
        <p className="text-muted-foreground">конфигурация системы и параметры лейбла</p>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>раздел в разработке</strong>
          <br />
          здесь скоро появятся настройки системы и другие административные функции
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">будущие настройки</CardTitle>
            <CardDescription>что планируется добавить</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">финансовые параметры</p>
                <p className="text-sm text-muted-foreground">комиссии, валюты, реквизиты</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">уведомления</p>
                <p className="text-sm text-muted-foreground">email, telegram, push-уведомления</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">системная информация</CardTitle>
            <CardDescription>текущее состояние</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">версия системы</span>
              <span className="text-sm font-mono">v1.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">последнее обновление</span>
              <span className="text-sm font-mono">17.08.2025</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;