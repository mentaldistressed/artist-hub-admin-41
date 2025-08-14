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
        description: "добро пожаловать!",
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
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">R+</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            rplus
          </h1>
          <p className="text-muted-foreground">
            портал выплат для артистов
          </p>
        </div>

        <Card className="glass-effect shadow-xl border-0 animate-scale-in">
          <CardContent className="p-8">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="signin" className="rounded-lg font-medium">вход</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg font-medium">регистрация</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-6 mt-0">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="font-medium text-foreground">
                      электронная почта
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@domain.com"
                      className="h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="font-medium text-foreground">
                      пароль
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl pr-12 transition-all"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent rounded-xl"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]" 
                    disabled={isLoading}
                  >
                    {isLoading ? "вход..." : "войти"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-6 mt-0">
                {!showAdminForm ? (
                  <form onSubmit={handleArtistSignUp} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="artist-pseudonym" className="font-medium text-foreground">
                        псевдоним
                      </Label>
                      <Input
                        id="artist-pseudonym"
                        value={artistData.pseudonym}
                        onChange={(e) => setArtistData(prev => ({ ...prev, pseudonym: e.target.value }))}
                        placeholder="ваш псевдоним"
                        className="h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="artist-telegram" className="font-medium text-foreground">
                        telegram
                      </Label>
                      <Input
                        id="artist-telegram"
                        value={artistData.telegram_contact}
                        onChange={(e) => setArtistData(prev => ({ ...prev, telegram_contact: e.target.value }))}
                        placeholder="@username"
                        className="h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="artist-email" className="font-medium text-foreground">
                        электронная почта
                      </Label>
                      <Input
                        id="artist-email"
                        type="email"
                        value={artistData.email}
                        onChange={(e) => setArtistData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="example@domain.com"
                        className="h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="artist-password" className="font-medium text-foreground">
                        пароль
                      </Label>
                      <div className="relative">
                        <Input
                          id="artist-password"
                          type={showPassword ? "text" : "password"}
                          value={artistData.password}
                          onChange={(e) => setArtistData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl pr-12 transition-all"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent rounded-xl"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]" 
                      disabled={isLoading}
                    >
                      {isLoading ? "регистрация..." : "зарегистрироваться"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleAdminSignUp} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name" className="font-medium text-foreground">
                        имя
                      </Label>
                      <Input
                        id="admin-name"
                        value={adminData.name}
                        onChange={(e) => setAdminData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ваше имя"
                        className="h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="font-medium text-foreground">
                        электронная почта
                      </Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={adminData.email}
                        onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="example@domain.com"
                        className="h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-password" className="font-medium text-foreground">
                        пароль
                      </Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          value={adminData.password}
                          onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl pr-12 transition-all"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent rounded-xl"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]" 
                      disabled={isLoading}
                    >
                      {isLoading ? "регистрация..." : "зарегистрироваться как администратор"}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full h-12 text-sm hover:bg-muted/50 rounded-xl transition-all"
                      onClick={() => setShowAdminForm(false)}
                    >
                      назад к регистрации артиста
                    </Button>
                  </form>
                )}
                
                {!showAdminForm && (
                  <div className="text-center pt-4 border-t border-border/50">
                    <Button 
                      variant="ghost" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowAdminForm(true)}
                    >
                      регистрация администратора
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};