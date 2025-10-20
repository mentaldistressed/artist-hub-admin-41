import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { FileUpload } from '@/components/ui/file-upload';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  role: 'artist' | 'admin';
  pseudonym?: string;
  name?: string;
}

interface Report {
  id: string;
  artist_id: string;
  quarter: string;
  file_url?: string;
  amount_rub: number;
  created_at: string;
  updated_at: string;
}

const AdminReports = () => {
  const [artists, setArtists] = useState<Profile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1 2025');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'partial' | 'empty'>('all');
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'artist')
        .order('pseudonym');

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('quarter', selectedQuarter);

      if (error) throw error;
      setReports(data || []);
      
      const newAmounts: { [key: string]: string } = {};
      data?.forEach(report => {
        newAmounts[report.artist_id] = report.amount_rub.toString();
      });
      setAmounts(newAmounts);
      
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    if (selectedQuarter) {
      fetchReports();
    }
  }, [selectedQuarter]);

  const handleFileUpload = async (artistId: string, file: File) => {
    setUploadingFiles(prev => ({ ...prev, [artistId]: true }));
    
    try {
      const fileName = `${selectedQuarter.replace(' ', '_')}_${artistId}_${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(filePath);

      const existingReport = reports.find(r => r.artist_id === artistId);
      
      if (existingReport) {
        const { error } = await supabase
          .from('reports')
          .update({ file_url: publicUrl, updated_at: new Date().toISOString() })
          .eq('id', existingReport.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reports')
          .insert({
            artist_id: artistId,
            quarter: selectedQuarter,
            file_url: publicUrl,
            amount_rub: parseFloat(amounts[artistId] || '0')
          });
        
        if (error) throw error;
      }

      toast({
        title: "Файл загружен",
        description: "Отчет успешно сохранен",
      });

      await fetchReports();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить файл",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [artistId]: false }));
    }
  };

  const handleSaveAmount = async (artistId: string) => {
    try {
      const amount = parseFloat(amounts[artistId] || '0');
      const existingReport = reports.find(r => r.artist_id === artistId);
      
      if (existingReport) {
        const { error } = await supabase
          .from('reports')
          .update({ amount_rub: amount, updated_at: new Date().toISOString() })
          .eq('id', existingReport.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reports')
          .insert({
            artist_id: artistId,
            quarter: selectedQuarter,
            amount_rub: amount
          });
        
        if (error) throw error;
      }

      toast({
        title: "Сумма сохранена",
        description: "Данные успешно обновлены",
      });

      await fetchReports();
    } catch (error) {
      console.error('Error saving amount:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить сумму",
        variant: "destructive",
      });
    }
  };

  const getReportForArtist = (artistId: string) => reports.find(r => r.artist_id === artistId);

  const isReportComplete = (artistId: string) => {
    const report = getReportForArtist(artistId);
    if (!report) return false;
    return typeof report.amount_rub === 'number' && report.amount_rub >= 0;
  };

  const getCompletionStatus = (artistId: string) => {
    const report = getReportForArtist(artistId);
    if (report && typeof report.amount_rub === 'number' && report.amount_rub >= 0) {
      return { status: 'complete', label: 'направлен', color: 'green' };
    }
    if (report?.file_url) {
      return { status: 'partial', label: 'частично направлен', color: 'yellow' };
    }
    return { status: 'empty', label: 'не направлен', color: 'gray' };
  };

  const filteredArtists = artists.filter(artist => {
    if (statusFilter === 'all') return true;
    const { status } = getCompletionStatus(artist.id);
    return status === statusFilter;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">загрузка...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-foreground">Отчеты</h1>
            <p className="text-sm text-muted-foreground">Управление отчетами артистов</p>
          </div>
          <div className="flex gap-2">
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
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Фильтр по статусу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="complete">Направлен</SelectItem>
                <SelectItem value="partial">Частично</SelectItem>
                <SelectItem value="empty">Не направлен</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Отчеты за {selectedQuarter}</CardTitle>
            <CardDescription className="text-sm">
              Загрузка файлов и указание сумм для артистов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/20">
                  <TableHead className="text-muted-foreground">Статус</TableHead>
                  <TableHead className="text-muted-foreground">Артист</TableHead>
                  <TableHead className="text-muted-foreground">Файл отчета</TableHead>
                  <TableHead className="text-muted-foreground">Сумма (₽)</TableHead>
                  <TableHead className="text-muted-foreground">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArtists.map((artist) => {
                  const report = getReportForArtist(artist.id);
                  const completionStatus = getCompletionStatus(artist.id);
                  const isComplete = isReportComplete(artist.id);
                  
                  return (
                    <TableRow 
                      key={artist.id} 
                      className={`border-border/20 transition-colors ${
                        isComplete 
                          ? 'bg-green-50/50 hover:bg-green-50/70 dark:bg-green-950/20 dark:hover:bg-green-950/30' 
                          : completionStatus.status === 'partial'
                          ? 'bg-yellow-50/50 hover:bg-yellow-50/70 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/30'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {completionStatus.status === 'complete' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                              {completionStatus.label}
                            </Badge>
                          )}
                          {completionStatus.status === 'partial' && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {completionStatus.label}
                            </Badge>
                          )}
                          {completionStatus.status === 'empty' && (
                            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                              {completionStatus.label}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium text-sm ${isComplete ? 'text-green-700 dark:text-green-400' : ''}`}>
                          {artist.pseudonym}
                          {isComplete && (
                            <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                              Отчет направлен
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileUpload
                            onFileSelect={(file) => handleFileUpload(artist.id, file)}
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            maxSize={10}
                            isUploading={uploadingFiles[artist.id]}
                            currentFile={report?.file_url}
                            placeholder="Загрузить отчет"
                            variant="minimal"
                            disabled={uploadingFiles[artist.id]}
                          />
                          {report?.file_url && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={amounts[artist.id] || ''}
                            onChange={(e) => setAmounts(prev => ({ 
                              ...prev, 
                              [artist.id]: e.target.value 
                            }))}
                            className={`w-24 h-8 text-xs ${
                              report && typeof report.amount_rub === 'number' && report.amount_rub >= 0
                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' 
                                : ''
                            }`}
                          />
                          {report && typeof report.amount_rub === 'number' && report.amount_rub >= 0 && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={isComplete ? "default" : "outline"}
                          onClick={() => handleSaveAmount(artist.id)}
                          className={`h-8 px-3 text-xs ${
                            isComplete 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : ''
                          }`}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          {isComplete ? 'Обновить' : 'Сохранить'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminReports;
