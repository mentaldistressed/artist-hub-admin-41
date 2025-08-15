import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthForm = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
    } else {
      toast({
        title: "вход выполнен",
        description: "добро пожаловать!",
      });
      navigate('/');
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
        description: "добро пожаловать!",
      });
      navigate('/');
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
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
            rplus
          </h1>
          <p className="text-sm text-muted-foreground">
            портал выплат для артистов
          </p>
        </div>

        <Card className="border-border/50 shadow-none">
          <CardContent className="p-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/30">
                <TabsTrigger value="signin" className="text-sm">вход</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">регистрация</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-0">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">
                      электронная почта
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@domain.com"
                      className="h-10 border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">
                      пароль
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-10 border-border/50 focus:border-primary pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? "вход..." : "войти"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-0">
                {!showAdminForm ? (
                  <form onSubmit={handleArtistSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="artist-pseudonym" className="text-sm font-medium">
                        псевдоним
                      </Label>
                      <Input
                        id="artist-pseudonym"
                        value={artistData.pseudonym}
                        onChange={(e) => setArtistData(prev => ({ ...prev, pseudonym: e.target.value }))}
                        placeholder="ваш псевдоним"
                        className="h-10 border-border/50 focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="artist-telegram" className="text-sm font-medium">
                        telegram
                      </Label>
                      <Input
                        id="artist-telegram"
                        value={artistData.telegram_contact}
                        onChange={(e) => setArtistData(prev => ({ ...prev, telegram_contact: e.target.value }))}
                        placeholder="@username"
                        className="h-10 border-border/50 focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="artist-email" className="text-sm font-medium">
                        электронная почта
                      </Label>
                      <Input
                        id="artist-email"
                        type="email"
                        value={artistData.email}
                        onChange={(e) => setArtistData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="example@domain.com"
                        className="h-10 border-border/50 focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="artist-password" className="text-sm font-medium">
                        пароль
                      </Label>
                      <div className="relative">
                        <Input
                          id="artist-password"
                          type={showPassword ? "text" : "password"}
                          value={artistData.password}
                          onChange={(e) => setArtistData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-10 border-border/50 focus:border-primary pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
                      disabled={isLoading}
                    >
                      {isLoading ? "регистрация..." : "зарегистрироваться"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleAdminSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name" className="text-sm font-medium">
                        имя
                      </Label>
                      <Input
                        id="admin-name"
                        value={adminData.name}
                        onChange={(e) => setAdminData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ваше имя"
                        className="h-10 border-border/50 focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="text-sm font-medium">
                        электронная почта
                      </Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={adminData.email}
                        onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="example@domain.com"
                        className="h-10 border-border/50 focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-password" className="text-sm font-medium">
                        пароль
                      </Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          value={adminData.password}
                          onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-10 border-border/50 focus:border-primary pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
                      disabled={isLoading}
                    >
                      {isLoading ? "регистрация..." : "зарегистрироваться как администратор"}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full h-10 text-sm"
                      onClick={() => setShowAdminForm(false)}
                    >
                      назад к регистрации артиста
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
                  {!showAdminForm && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setShowAdminForm(true)}
                    >
                      регистрация администратора
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
          </CardContent>
        </Card>
      </div>
    </div>
  );
};