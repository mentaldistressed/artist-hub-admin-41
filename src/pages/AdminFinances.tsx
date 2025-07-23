import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, Users, Edit } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  role: 'artist' | 'admin';
  pseudonym?: string;
  name?: string;
  balance_rub: number;
}

const AdminFinances = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editBalance, setEditBalance] = useState('');
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, role, pseudonym, name, balance_rub')
        .order('balance_rub', { ascending: false });

      if (error) {
        toast({
          title: "ошибка загрузки",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ balance_rub: parseFloat(editBalance) })
        .eq('id', selectedUser.id);

      if (error) {
        toast({
          title: "ошибка обновления баланса",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "баланс обновлен",
        description: `баланс пользователя изменен на ${editBalance} руб.`,
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setEditBalance('');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const totalBalance = users.reduce((sum, user) => sum + user.balance_rub, 0);
  const artistsCount = users.filter(user => user.role === 'artist').length;
  const averageBalance = artistsCount > 0 ? totalBalance / artistsCount : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64">загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">управление финансами</h1>
        <p className="text-muted-foreground">контроль балансов и финансовых операций</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">общий баланс</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBalance.toFixed(2)} ₽</div>
            <p className="text-xs text-muted-foreground">сумма всех балансов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">средний баланс</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageBalance.toFixed(2)} ₽</div>
            <p className="text-xs text-muted-foreground">на одного артиста</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">активных артистов</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{artistsCount}</div>
            <p className="text-xs text-muted-foreground">зарегистрированных</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>балансы пользователей</CardTitle>
          <CardDescription>
            управление финансами артистов и администраторов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>пользователь</TableHead>
                <TableHead>роль</TableHead>
                <TableHead className="text-right">баланс</TableHead>
                <TableHead>действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">
                      {user.role === 'admin' ? user.name : user.pseudonym}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'администратор' : 'артист'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono ${user.balance_rub >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {user.balance_rub.toFixed(2)} ₽
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setEditBalance(user.balance_rub.toString());
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      редактировать
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Диалог редактирования баланса */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>изменить баланс</DialogTitle>
            <DialogDescription>
              редактирование баланса пользователя: {selectedUser?.role === 'admin' ? selectedUser?.name : selectedUser?.pseudonym}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateBalance} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-balance">новый баланс (рубли)</Label>
              <Input
                id="edit-balance"
                type="number"
                step="0.01"
                value={editBalance}
                onChange={(e) => setEditBalance(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                текущий баланс: {selectedUser?.balance_rub.toFixed(2)} ₽
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">
                сохранить изменения
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinances;