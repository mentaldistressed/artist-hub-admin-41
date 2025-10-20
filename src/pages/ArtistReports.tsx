import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { FileUpload } from '@/components/ui/file-upload';
import { Download, Send, AlertCircle } from 'lucide-react';

interface Report {
  id: string;
  artist_id: string;
  quarter: string;
  file_url?: string | null;
  amount_rub: number;
  created_at: string;
  updated_at: string;
}

interface PayoutRequest {
  id: string;
  artist_id: string;
  quarter: string;
  amount_rub: number;
  inn: string;
  full_name: string;
  bik: string;
  account_number: string;
  is_self_employed: boolean;
  status: 'pending' | 'completed';
  tax_receipt_url?: string | null;
  created_at: string;
}

const ArtistReports = () => {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

  const [payoutData, setPayoutData] = useState({
    contract_number: '',
    inn: '',
    full_name: '',
    bik: '',
    account_number: '',
    is_self_employed: false,
  });

  // Загрузка платёжных реквизитов из профиля или последней заявки
  const loadPayoutData = async () => {
    if (!profile?.id) return;

    // Сначала из профиля
    if (profile.contract_number || profile.inn || profile.full_name) {
      setPayoutData({
        contract_number: profile.contract_number || '',
        inn: profile.inn || '',
        full_name: profile.full_name || '',
        bik: profile.bik || '',
        account_number: profile.account_number || '',
        is_self_employed: !!profile.is_self_employed,
      });
      return;
    }

    // Если в профиле нет данных — из последней заявки
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('contract_number, inn, full_name, bik, account_number, is_self_employed')
        .eq('artist_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setPayoutData({
          contract_number: data.contract_number || '',
          inn: data.inn || '',
          full_name: data.full_name || '',
          bik: data.bik || '',
          account_number: data.account_number || '',
          is_self_employed: !!data.is_self_employed,
        });
      }
    } catch (error) {
      // Если нет предыдущих заявок — оставляем пустые поля
      console.log('No previous payout requests found');
    }
  };

  const fetchReports = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('artist_id', profile.id)
        .order('quarter');

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchPayoutRequests = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('artist_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayoutRequests(data || []);
    } catch (error) {
      console.error('Error fetching payout requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchReports();
      fetchPayoutRequests();
    }
  }, [profile?.id]);

  const getReportForQuarter = (quarter: string) => reports.find((r) => r.quarter === quarter);
  const getPayoutRequestForQuarter = (quarter: string) => payoutRequests.find((r) => r.quarter === quarter);

  const handleDownloadFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleSubmitPayoutRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile?.id) return;

    const formData = new FormData(e.currentTarget);
    const reportId = formData.get('reportId') as string;
    const report = reports.find((r) => r.id === reportId);

    if (!report) return;

    try {
      const { error } = await supabase.from('payout_requests').insert({
        artist_id: profile.id,
        quarter: report.quarter,
        amount_rub: report.amount_rub,
        contract_number: payoutData.contract_number,
        inn: payoutData.inn,
        full_name: payoutData.full_name,
        bik: payoutData.bik,
        account_number: payoutData.account_number,
        is_self_employed: payoutData.is_self_employed,
        status: 'pending',
      });

      if (error) throw error;

      // Сохраняем данные в профиль для будущего использования
      await supabase
        .from('profiles')
        .update({
          contract_number: payoutData.contract_number,
          inn: payoutData.inn,
          full_name: payoutData.full_name,
          bik: payoutData.bik,
          account_number: payoutData.account_number,
          is_self_employed: payoutData.is_self_employed,
        })
        .eq('id', profile.id);

      toast({
        title: 'Заявка отправлена',
        description: 'Ваша заявка на выплату принята в обработку',
      });

      setPayoutData({
        contract_number: '',
        inn: '',
        full_name: '',
        bik: '',
        account_number: '',
        is_self_employed: false,
      });

      await fetchPayoutRequests();
    } catch (error) {
      console.error('Error submitting payout request:', error);
      toast({
        title: 'Ошибка отправки',
        description: 'Не удалось отправить заявку на выплату',
        variant: 'destructive',
      });
    }
  };

  const handleTaxReceiptUpload = async (requestId: string, file: File) => {
    setUploadingReceipt((prev) => ({ ...prev, [requestId]: true }));

    try {
      const fileName = `tax_receipt_${requestId}_${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `tax-receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('reports').upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('reports').getPublicUrl(filePath);

      const { error } = await supabase
        .from('payout_requests')
        .update({ tax_receipt_url: publicUrl })
        .eq('id', requestId);

      if (error) throw error;

      toast({ title: 'Чек загружен', description: 'Чек об уплате налога успешно загружен' });

      await fetchPayoutRequests();
    } catch (error) {
      console.error('Error uploading tax receipt:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить чек',
        variant: 'destructive',
      });
    } finally {
      setUploadingReceipt((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const getPayoutStatus = (quarter: string) => {
    const request = getPayoutRequestForQuarter(quarter);
    if (!request) return null;

    if (request.status === 'completed') {
      return (
        <div className="space-y-2">
          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">✓ Выплата выполнена</div>
          {!request.tax_receipt_url && (
            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">⚠ Требуется чек об уплате налога</div>
          )}
          {request.tax_receipt_url && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">✓ Чек загружен</div>
          )}
        </div>
      );
    }

    return <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">⏳ Заявка в обработке</div>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Отчёты</h1>
          <p className="text-sm text-muted-foreground">Ваши отчёты и заявки на выплаты</p>
        </div>

        <div className="grid gap-4">
          {quarters.map((quarter) => {
            const report = getReportForQuarter(quarter);
            const payoutStatus = getPayoutStatus(quarter);
            const hasPayoutRequest = getPayoutRequestForQuarter(quarter);

            return (
              <Card key={quarter} className="border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">{quarter}</CardTitle>
                  <CardDescription className="text-sm">Отчёт за {quarter}</CardDescription>
                  {quarter === 'Q3 2025' && (
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-border/20">
                      <p className="text-xs text-muted-foreground">Примерная запланированная дата получения отчёта за {quarter}: 15 ноября 2025 года</p>
                    </div>
                  )}
                  {quarter === 'Q4 2025' && (
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-т border-border/20">
                      <p className="text-xs text-muted-foreground">Примерная запланированная дата получения отчёта за {quarter}: 15 февраля 2026 года</p>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {!report || report.amount_rub === 0 ? (
                    <>
                      {report && report.amount_rub === 0 ? (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          Сумма отчислений за {quarter} составляет 0 рублей, отчёт недоступен к просмотру
                        </div>
                      ) : quarter === 'Q1 2025' ? (
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          Отчётный период завершён
                        </div>
                      ) : quarter === 'Q3 2025' ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <AlertCircle className="h-4 w-4" />
                          Отчётный период ещё не начался
                        </div>
                      ) : quarter === 'Q4 2025' ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <AlertCircle className="h-4 w-4" />
                          Отчётный период ещё не начался
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <AlertCircle className="h-4 w-4" />
                          Находитесь в очереди на получение отчёта
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Сумма:</span>
                            <span className="font-mono ml-2">{report.amount_rub.toFixed(2)} ₽</span>
                          </div>
                          {report.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadFile(report.file_url!)}
                              className="h-8 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Скачать отчёт
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {payoutStatus}
                          {!hasPayoutRequest && (
                            // 🔽 Логика порога 50 рублей: если меньше 50 — блокируем кнопку и меняем текст
                            report.amount_rub < 50 ? (
                              <Button size="sm" disabled className="h-8 text-xs opacity-70 cursor-not-allowed">
                                Выплаты осуществляются от 50 рублей
                              </Button>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setCurrentReport(report);
                                      loadPayoutData();
                                    }}
                                    className="h-8 text-xs"
                                  >
                                    <Send className="h-3 w-3 mr-1" />
                                    Подать заявку на выплату
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Заявка на выплату</DialogTitle>
                                    <DialogDescription>Заполните реквизиты для получения выплаты за {report.quarter}</DialogDescription>
                                  </DialogHeader>

                                  <form onSubmit={handleSubmitPayoutRequest} className="space-y-4">
                                    <input type="hidden" name="reportId" value={report.id} />

                                    <div className="space-y-2">
                                      <Label htmlFor="contract_number" className="text-sm">
                                        Номер договора
                                      </Label>
                                      <Input
                                        id="contract_number"
                                        value={payoutData.contract_number}
                                        onChange={(e) => setPayoutData((prev) => ({ ...prev, contract_number: e.target.value }))}
                                        placeholder="№ 123/2025"
                                        required
                                        className="h-9 text-sm"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="inn" className="text-sm">
                                        ИНН (ваш)
                                      </Label>
                                      <Input
                                        id="inn"
                                        value={payoutData.inn}
                                        onChange={(e) => setPayoutData((prev) => ({ ...prev, inn: e.target.value }))}
                                        placeholder="123456789012"
                                        required
                                        className="h-9 text-sm"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="full_name" className="text-sm">
                                        ФИО
                                      </Label>
                                      <Input
                                        id="full_name"
                                        value={payoutData.full_name}
                                        onChange={(e) => setPayoutData((prev) => ({ ...prev, full_name: e.target.value }))}
                                        placeholder="Иванов Иван Иванович"
                                        required
                                        className="h-9 text-sm"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="bik" className="text-sm">
                                        БИК
                                      </Label>
                                      <Input
                                        id="bik"
                                        value={payoutData.bik}
                                        onChange={(e) => setPayoutData((prev) => ({ ...prev, bik: e.target.value }))}
                                        placeholder="044525225"
                                        required
                                        className="h-9 text-sm"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="account_number" className="text-sm">
                                        Номер счёта
                                      </Label>
                                      <Input
                                        id="account_number"
                                        value={payoutData.account_number}
                                        onChange={(e) => setPayoutData((prev) => ({ ...prev, account_number: e.target.value }))}
                                        placeholder="40817810099910004312"
                                        required
                                        className="h-9 text-sm"
                                      />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id="is_self_employed"
                                        checked={payoutData.is_self_employed}
                                        onCheckedChange={(checked) =>
                                          setPayoutData((prev) => ({ ...prev, is_self_employed: Boolean(checked) }))
                                        }
                                      />
                                      <Label htmlFor="is_self_employed" className="text-sm">
                                        Наличие открытой самозанятости / ИП
                                      </Label>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                      <Button type="submit" size="sm" className="h-9 text-sm">
                                        Отправить заявку
                                      </Button>
                                      <Button type="button" variant="outline" size="sm" className="h-9 text-sm">
                                        Отмена
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            )
                          )}
                          {hasPayoutRequest && hasPayoutRequest.status === 'completed' && !hasPayoutRequest.tax_receipt_url && (
                            <div className="space-y-2">
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-foreground">Загрузить чек об уплате налога:</Label>
                                <FileUpload
                                  onFileSelect={(file) => handleTaxReceiptUpload(hasPayoutRequest.id, file)}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  maxSize={5}
                                  isUploading={uploadingReceipt[hasPayoutRequest.id]}
                                  placeholder="Выберите чек об уплате налога"
                                  variant="compact"
                                  disabled={uploadingReceipt[hasPayoutRequest.id]}
                                />
                              </div>
                            </div>
                          )}
                          {hasPayoutRequest && hasPayoutRequest.tax_receipt_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(hasPayoutRequest.tax_receipt_url!, '_blank')}
                              className="h-8 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Скачать чек
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default ArtistReports;
