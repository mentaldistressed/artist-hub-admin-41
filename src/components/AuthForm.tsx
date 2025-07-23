import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export const AuthForm = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  
  // Форма входа
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  // Форма регистрации артиста
  const [artistData, setArtistData] = useState({
    pseudonym: '',
    telegram_contact: '',
    email: '',
    password: ''
  });
  
  // Форма регистрации админа
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(signInData.email, signInData.password);
    
    if (error) {
      toast({
        title: "ошибка входа",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleArtistSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(
      artistData.email, 
      artistData.password, 
      'artist',
      {
        pseudonym: artistData.pseudonym,
        telegram_contact: artistData.telegram_contact
      }
    );
    
    if (error) {
      toast({
        title: "ошибка регистрации",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "регистрация успешна",
        description: "добро пожаловать в лейбл!",
      });
    }
    
    setIsLoading(false);
  };

  const handleAdminSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(
      adminData.email, 
      adminData.password, 
      'admin',
      {
        name: adminData.name
      }
    );
    
    if (error) {
      toast({
        title: "ошибка регистрации администратора",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "администратор зарегистрирован",
        description: "добро пожаловать!",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">rplus » портал выплат</CardTitle>
          <CardDescription>добро пожаловать</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">вход</TabsTrigger>
              <TabsTrigger value="signup">регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">электронная почта</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@domain.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">пароль</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "вход..." : "войти в систему"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              {!showAdminForm ? (
                <form onSubmit={handleArtistSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="artist-pseudonym">псевдоним</Label>
                    <Input
                      id="artist-pseudonym"
                      value={artistData.pseudonym}
                      onChange={(e) => setArtistData(prev => ({ ...prev, pseudonym: e.target.value }))}
                      placeholder="ваш псевдоним"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="artist-telegram">telegram контакт</Label>
                    <Input
                      id="artist-telegram"
                      value={artistData.telegram_contact}
                      onChange={(e) => setArtistData(prev => ({ ...prev, telegram_contact: e.target.value }))}
                      placeholder="@username"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="artist-email">электронная почта</Label>
                    <Input
                      id="artist-email"
                      type="email"
                      value={artistData.email}
                      onChange={(e) => setArtistData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="mymail@gmail.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="artist-password">пароль</Label>
                    <div className="relative">
                      <Input
                        id="artist-password"
                        type={showPassword ? "text" : "password"}
                        value={artistData.password}
                        onChange={(e) => setArtistData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "регистрация..." : "зарегистрироваться"}
                  </Button>
                  
                  {/* <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAdminForm(true)}
                  >
                    регистрация администратора
                  </Button> */}
                </form>
              ) : (
                <form onSubmit={handleAdminSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">имя</Label>
                    <Input
                      id="admin-name"
                      value={adminData.name}
                      onChange={(e) => setAdminData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ваше имя"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">электронная почта</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={adminData.email}
                      onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@domain.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">пароль</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        value={adminData.password}
                        onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "регистрация..." : "зарегистрироваться как администратор"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAdminForm(false)}
                  >
                    назад к регистрации артиста
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};