import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/Layout';
import { Settings } from 'lucide-react';

const AdminSettings = () => {
  return (
    <Layout>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Настройки</h1>
        <p className="text-muted-foreground">Конфигурация системы и параметры лейбла</p>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Раздел в разработке</strong>
          <br />
          Здесь скоро появятся настройки системы и другие административные функции
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Будущие настройки</CardTitle>
            <CardDescription>Что планируется добавить</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Финансовые параметры</p>
                <p className="text-sm text-muted-foreground">комиссии, валюты, реквизиты</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Уведомления</p>
                <p className="text-sm text-muted-foreground">email, telegram, push-уведомления</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Системная информация</CardTitle>
            <CardDescription>Текущее состояние</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Версия системы</span>
              <span className="text-sm font-mono">v1.1.0.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Последнее обновление</span>
              <span className="text-sm font-mono">18.08.2025 01:20</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;