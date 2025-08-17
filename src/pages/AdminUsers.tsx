import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { Plus, Search, Edit } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  role: 'artist' | 'admin';
  pseudonym?: string;
  telegram_contact?: string;
  name?: string;
  balance_rub: number;
  created_at: string;
  updated_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    role: 'artist' as 'artist' | 'admin',
    pseudonym: '',
    telegram_contact: '',
    name: ''
  });

  const [editBalance, setEditBalance] = useState('');

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const metadata: any = { role: newUserData.role };
      
      if (newUserData.role === 'artist') {
        metadata.pseudonym = newUserData.pseudonym;
        metadata.telegram_contact = newUserData.telegram_contact;
      } else {
        metadata.name = newUserData.name;
      }

      const { error } = await supabase.auth.admin.createUser({
        email: newUserData.email,
        password: newUserData.password,
        user_metadata: metadata,
        email_confirm: true
      });

      if (error) {
        toast({
          title: "Ошибка создания пользователя",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Пользователь создан",
        description: "Новый пользователь успешно добавлен",
      });

      setIsAddDialogOpen(false);
      setNewUserData({
        email: '',
        password: '',
        role: 'artist',
        pseudonym: '',
        telegram_contact: '',
        name: ''
      });
      
      // Обновляем список пользователей
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

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
          title: "Ошибка обновления баланса",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Баланс обновлен",
        description: `Баланс пользователя изменен на ${editBalance} руб.`,
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setEditBalance('');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.pseudonym?.toLowerCase().includes(searchLower) ||
      user.name?.toLowerCase().includes(searchLower) ||
      user.telegram_contact?.toLowerCase().includes(searchLower)
    );
  });

  if (loading && users.length === 0) {
    return <div className="flex items-center justify-center h-64">загрузка...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Пользователи</h1>
          <p className="text-muted-foreground">Управление артистами и администраторами</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить пользователя
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить нового пользователя</DialogTitle>
              <DialogDescription>
                Создайте аккаунт для нового артиста или администратора
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-email">Электронная почта</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-password">Пароль</Label>
                <Input
                  id="add-password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-role">Роль</Label>
                <Select value={newUserData.role} onValueChange={(value: 'artist' | 'admin') => 
                  setNewUserData(prev => ({ ...prev, role: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="artist">Артист</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newUserData.role === 'artist' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="add-pseudonym">Псевдоним</Label>
                    <Input
                      id="add-pseudonym"
                      value={newUserData.pseudonym}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, pseudonym: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-telegram">Телеграм контакт</Label>
                    <Input
                      id="add-telegram"
                      value={newUserData.telegram_contact}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, telegram_contact: e.target.value }))}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="add-name">Имя</Label>
                  <Input
                    id="add-name"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Создание..." : "Создать пользователя"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  отмена
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени, псевдониму или телеграм..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
          <CardDescription>
            Всего пользователей: {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Контакт</TableHead>
                <TableHead>Баланс</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {user.role === 'admin' ? user.name : user.pseudonym}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Администратор' : 'Артист'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.telegram_contact || '-'}
                  </TableCell>
                  <TableCell>
                    {user.balance_rub.toFixed(2)} ₽
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
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
                      <Edit className="h-4 w-4" />
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
            <DialogTitle>Изменить баланс</DialogTitle>
            <DialogDescription>
              Редактирование баланса пользователя: {selectedUser?.role === 'admin' ? selectedUser?.name : selectedUser?.pseudonym}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateBalance} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-balance">Новый баланс (рубли)</Label>
              <Input
                id="edit-balance"
                type="number"
                step="0.01"
                value={editBalance}
                onChange={(e) => setEditBalance(e.target.value)}
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">
                Сохранить
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
};

export default AdminUsers;