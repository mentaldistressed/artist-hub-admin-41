import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { CheckCircle, Clock, Download, FileText } from 'lucide-react';

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
  tax_receipt_url?: string;
  created_at: string;
  updated_at: string;
  artist?: {
    pseudonym: string;
  };
}

const AdminPayouts = () => {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1 2025');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

  const fetchPayoutRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select(`
          *,
          artist:profiles!payout_requests_artist_id_fkey(pseudonym)
        `)
        .eq('quarter', selectedQuarter)
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
    if (selectedQuarter) {
      fetchPayoutRequests();
    }
  }, [selectedQuarter]);

  const handleStatusChange = async (requestId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({ 
          status: completed ? 'completed' : 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: completed ? "заявка выполнена" : "заявка возвращена в обработку",
        description: "статус успешно обновлен",
      });

      await fetchPayoutRequests();
    } catch (error) {
      console.error('Error updating payout status:', error);
      toast({
        title: "ошибка обновления",
        description: "не удалось изменить статус заявки",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          выполнена
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        в обработке
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">загрузка...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-foreground">выплаты</h1>
            <p className="text-sm text-muted-foreground">управление заявками на выплаты</p>
          </div>
          
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quarters.map(quarter => (
                <SelectItem key={quarter} value={quarter}>
                  {quarter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium">заявки на выплаты за {selectedQuarter}</CardTitle>
            <CardDescription className="text-sm">
              всего заявок: {payoutRequests.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payoutRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                нет заявок на выплаты за выбранный период
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/20">
                    <TableHead className="text-muted-foreground">артист</TableHead>
                    <TableHead className="text-muted-foreground">сумма</TableHead>
                    <TableHead className="text-muted-foreground">реквизиты</TableHead>
                    <TableHead className="text-muted-foreground">статус</TableHead>
                    <TableHead className="text-muted-foreground">чек об уплате налога</TableHead>
                    <TableHead className="text-muted-foreground">дата</TableHead>
                    <TableHead className="text-muted-foreground">действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutRequests.map((request) => (
                    <TableRow key={request.id} className="border-border/20">
                      <TableCell>
                        <div className="font-medium text-sm">
                          {request.artist?.pseudonym}
                          {request.quarter === 'Q1 2025' && request.artist?.requires_q1_2025_status && (
                            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200 mt-1 inline-block">
                              ⚠ требуется статус на 15.08.2025
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {request.amount_rub.toFixed(2)} ₽
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div><span className="text-muted-foreground">ИНН:</span> {request.inn}</div>
                          <div><span className="text-muted-foreground">ФИО:</span> {request.full_name}</div>
                          <div><span className="text-muted-foreground">БИК:</span> {request.bik}</div>
                          <div><span className="text-muted-foreground">Счет:</span> {request.account_number}</div>
                          {request.is_self_employed && (
                            <div className="text-green-600">✓ Самозанятый/ИП</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {request.status === 'completed' && (
                          <div className="space-y-2">
                            {request.tax_receipt_url ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(request.tax_receipt_url, '_blank')}
                                className="h-7 text-xs"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                просмотреть чек
                              </Button>
                            ) : (
                              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                                ожидается чек
                              </div>
                            )}
                          </div>
                        )}
                        {request.status === 'pending' && (
                          <div className="text-xs text-muted-foreground">-</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString('ru-RU')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={request.status === 'completed'}
                            onCheckedChange={(checked) => 
                              handleStatusChange(request.id, checked as boolean)
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            выполнена
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminPayouts;