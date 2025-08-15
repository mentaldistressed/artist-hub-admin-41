import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { FileText, Download, Send, AlertCircle } from 'lucide-react';

interface Report {
  id: string;
  artist_id: string;
  quarter: string;
  file_url?: string;
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
  created_at: string;
}

const ArtistReports = () => {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1 2025');
  const [loading, setLoading] = useState(true);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const { toast } = useToast();

  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

  const [payoutData, setPayoutData] = useState({
    inn: '',
    full_name: '',
    bik: '',
    account_number: '',
    is_self_employed: false
  });

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

  const getReportForQuarter = (quarter: string) => {
    return reports.find(r => r.quarter === quarter);
  };

  const getPayoutRequestForQuarter = (quarter: string) => {
    return payoutRequests.find(r => r.quarter === quarter);
  };

  const handleDownloadFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleSubmitPayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReport || !profile?.id) return;

    try {
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          artist_id: profile.id,
          quarter: currentReport.quarter,
          amount_rub: currentReport.amount_rub,
          inn: payoutData.inn,
          full_name: payoutData.full_name,
          bik: payoutData.bik,
          account_number: payoutData.account_number,
          is_self_employed: payoutData.is_self_employed,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "заявка отправлена",
        description: "ваша заявка на выплату принята в обработку",
      });

      setIsPayoutDialogOpen(false);
      setCurrentReport(null);
      setPayoutData({
        inn: '',
        full_name: '',
        bik: '',
        account_number: '',
        is_self_employed: false
      });

      await fetchPayoutRequests();
    } catch (error) {
      console.error('Error submitting payout request:', error);
      toast({
        title: "ошибка отправки",
        description: "не удалось отправить заявку на выплату",
        variant: "destructive",
      });
    }
  };

  const getPayoutStatus = (quarter: string) => {
    const request = getPayoutRequestForQuarter(quarter);
    if (!request) return null;
    
    if (request.status === 'completed') {
      return (
        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
          ✓ выплата выполнена
        </div>
      );
    }
    
    return (
      <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
        ⏳ заявка в обработке
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">загрузка...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground">отчеты</h1>
          <p className="text-sm text-muted-foreground">ваши отчеты и заявки на выплаты</p>
        </div>

        <div className="grid gap-4">
          {quarters.map(quarter => {
            const report = getReportForQuarter(quarter);
            const payoutStatus = getPayoutStatus(quarter);
            const hasPayoutRequest = getPayoutRequestForQuarter(quarter);
            
            return (
              <Card key={quarter} className="border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">{quarter}</CardTitle>
                  <CardDescription className="text-sm">
                    отчет за {quarter.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!report ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <AlertCircle className="h-4 w-4" />
                      нет данных
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">сумма:</span>
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
                              скачать отчет
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {payoutStatus}
                          {!hasPayoutRequest && (
                            <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setCurrentReport(report)}
                                  className="h-8 text-xs"
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  подать заявку на выплату
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>заявка на выплату</DialogTitle>
                                  <DialogDescription>
                                    заполните реквизиты для получения выплаты за {currentReport?.quarter}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <form onSubmit={handleSubmitPayoutRequest} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="inn" className="text-sm">ИНН</Label>
                                    <Input
                                      id="inn"
                                      value={payoutData.inn}
                                      onChange={(e) => setPayoutData(prev => ({ ...prev, inn: e.target.value }))}
                                      placeholder="123456789012"
                                      required
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="full_name" className="text-sm">ФИО</Label>
                                    <Input
                                      id="full_name"
                                      value={payoutData.full_name}
                                      onChange={(e) => setPayoutData(prev => ({ ...prev, full_name: e.target.value }))}
                                      placeholder="Иванов Иван Иванович"
                                      required
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="bik" className="text-sm">БИК</Label>
                                    <Input
                                      id="bik"
                                      value={payoutData.bik}
                                      onChange={(e) => setPayoutData(prev => ({ ...prev, bik: e.target.value }))}
                                      placeholder="044525225"
                                      required
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="account_number" className="text-sm">номер счета</Label>
                                    <Input
                                      id="account_number"
                                      value={payoutData.account_number}
                                      onChange={(e) => setPayoutData(prev => ({ ...prev, account_number: e.target.value }))}
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
                                        setPayoutData(prev => ({ ...prev, is_self_employed: checked as boolean }))
                                      }
                                    />
                                    <Label htmlFor="is_self_employed" className="text-sm">
                                      открытие самозанятости / ИП
                                    </Label>
                                  </div>
                                  
                                  <div className="flex gap-2 pt-4">
                                    <Button type="submit" size="sm" className="h-9 text-sm">
                                      отправить заявку
                                    </Button>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setIsPayoutDialogOpen(false)}
                                      className="h-9 text-sm"
                                    >
                                      отмена
                                    </Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
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