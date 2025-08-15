import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { FileUpload } from '@/components/ui/file-upload';
import { FileText, Save } from 'lucide-react';

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
      
      // Заполняем amounts из существующих отчетов
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

      // Обновляем или создаем отчет
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
        title: "файл загружен",
        description: "отчет успешно сохранен",
      });

      await fetchReports();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "ошибка загрузки",
        description: "не удалось загрузить файл",
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
        title: "сумма сохранена",
        description: "данные успешно обновлены",
      });

      await fetchReports();
    } catch (error) {
      console.error('Error saving amount:', error);
      toast({
        title: "ошибка сохранения",
        description: "не удалось сохранить сумму",
        variant: "destructive",
      });
    }
  };

  const getReportForArtist = (artistId: string) => {
    return reports.find(r => r.artist_id === artistId);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">загрузка...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-foreground">отчеты</h1>
            <p className="text-sm text-muted-foreground">управление отчетами артистов</p>
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
            <CardTitle className="text-lg font-medium">отчеты за {selectedQuarter}</CardTitle>
            <CardDescription className="text-sm">
              загрузка файлов и указание сумм для артистов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/20">
                  <TableHead className="text-muted-foreground">артист</TableHead>
                  <TableHead className="text-muted-foreground">файл отчета</TableHead>
                  <TableHead className="text-muted-foreground">сумма (₽)</TableHead>
                  <TableHead className="text-muted-foreground">действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artists.map((artist) => {
                  const report = getReportForArtist(artist.id);
                  return (
                    <TableRow key={artist.id} className="border-border/20">
                      <TableCell>
                        <div className="font-medium text-sm">
                          {artist.pseudonym}
                        </div>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={amounts[artist.id] || ''}
                          onChange={(e) => setAmounts(prev => ({ 
                            ...prev, 
                            [artist.id]: e.target.value 
                          }))}
                          className="w-24 h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveAmount(artist.id)}
                          className="h-8 px-3 text-xs"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          сохранить
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