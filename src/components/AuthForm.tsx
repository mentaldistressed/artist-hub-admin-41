import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const AuthForm = () => {
  const { signIn, signUp, error, clearError, emailConfirmationSent, clearEmailConfirmation, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
    clearError();
    
    const success = await signIn(signInData.email, signInData.password);
    
    if (success) {
      toast({
        title: "вход выполнен",
        description: "добро пожаловать!",
      });
      navigate('/');
    }
  };

  const handleArtistSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
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
    }
    // Если нет ошибки, покажется окно подтверждения email
  };

  const handleAdminSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
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
    }
    // Если нет ошибки, покажется окно подтверждения email
  };

  // Если отправлено подтверждение email, показываем соответствующее сообщение
  if (emailConfirmationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="w-full max-w-md mx-auto animate-scale-in">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6 premium-shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3 text-premium-tight">
              Проверьте почту
            </h1>
            <p className="text-muted-foreground mb-6">
              Мы отправили письмо с подтверждением на вашу электронную почту
            </p>
          </div>

          <Card className="card-premium border-border/30 premium-shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Подтвердите регистрацию
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Перейдите по ссылке в письме, чтобы активировать аккаунт
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
                    <p className="text-xs font-medium text-foreground">что делать дальше:</p>
                    <p className="text-xs font-medium text-foreground">Что делать дальше:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Откройте свою электронную почту</li>
                      <li>• Найдите письмо от rplus</li>
                      <li>• Нажмите на ссылку подтверждения</li>
                      <li>• Вернитесь сюда для входа в систему</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={clearEmailConfirmation}
                    className="w-full h-12 btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl text-base"
                  >
                    Понятно, перейти к входу
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Не получили письмо? Проверьте папку "спам"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md mx-auto animate-scale-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-6 premium-shadow-lg">
            <span className="text-primary-foreground font-bold text-2xl">R</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3 text-premium-tight">
            rplus
          </h1>
          <p className="text-muted-foreground">
            Портал выплат для артистов
          </p>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 mt-4">
              {error}
            </div>
          )}
        </div>

        <Card className="card-premium border-border/30 premium-shadow-lg">
          <CardContent className="p-8">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="signin" className="text-sm font-medium rounded-lg">Вход</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium rounded-lg">Регистрация</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-6 mt-0">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="signin-email" className="text-sm font-semibold text-foreground">
                      Электронная почта
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@domain.com"
                      className="h-12 input-premium rounded-xl text-base"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="signin-password" className="text-sm font-semibold text-foreground">
                      Пароль
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-12 input-premium rounded-xl text-base pr-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent rounded-xl"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl text-base" 
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner size="sm" message="" /> : "Войти"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-6 mt-0">
                {!showAdminForm ? (
                  <form onSubmit={handleArtistSignUp} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="artist-pseudonym" className="text-sm font-semibold text-foreground">
                        Псевдоним
                      </Label>
                      <Input
                        id="artist-pseudonym"
                        value={artistData.pseudonym}
                        onChange={(e) => setArtistData(prev => ({ ...prev, pseudonym: e.target.value }))}
                        placeholder="ваш псевдоним"
                        placeholder="Ваш псевдоним"
                        className="h-12 input-premium rounded-xl text-base"
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="artist-telegram" className="text-sm font-semibold text-foreground">
                        Telegram
                      </Label>
                      <Input
                        id="artist-telegram"
                        value={artistData.telegram_contact}
                        onChange={(e) => setArtistData(prev => ({ ...prev, telegram_contact: e.target.value }))}
                        placeholder="@username"
                        className="h-12 input-premium rounded-xl text-base"
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="artist-email" className="text-sm font-semibold text-foreground">
                        Электронная почта
                      </Label>
                      <Input
                        id="artist-email"
                        type="email"
                        value={artistData.email}
                        onChange={(e) => setArtistData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="example@domain.com"
                        className="h-12 input-premium rounded-xl text-base"
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="artist-password" className="text-sm font-semibold text-foreground">
                        Пароль
                      </Label>
                      <div className="relative">
                        <Input
                          id="artist-password"
                          type={showPassword ? "text" : "password"}
                          value={artistData.password}
                          onChange={(e) => setArtistData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12 input-premium rounded-xl text-base pr-12"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent rounded-xl"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl text-base" 
                      disabled={isLoading}
                    >
                      {isLoading ? <LoadingSpinner size="sm" message="" /> : "Зарегистрироваться"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleAdminSignUp} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="admin-name" className="text-sm font-semibold text-foreground">
                        Имя
                      </Label>
                      <Input
                        id="admin-name"
                        value={adminData.name}
                        onChange={(e) => setAdminData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ваше имя"
                        placeholder="Ваше имя"
                        className="h-12 input-premium rounded-xl text-base"
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="admin-email" className="text-sm font-semibold text-foreground">
                        Электронная почта
                      </Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={adminData.email}
                        onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="example@domain.com"
                        className="h-12 input-premium rounded-xl text-base"
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="admin-password" className="text-sm font-semibold text-foreground">
                        Пароль
                      </Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          value={adminData.password}
                          onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12 input-premium rounded-xl text-base pr-12"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent rounded-xl"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl text-base" 
                      disabled={isLoading}
                    >
                      {isLoading ? <LoadingSpinner size="sm" message="" /> : "Зарегистрироваться как администратор"}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-12 text-sm font-medium rounded-xl"
                      onClick={() => setShowAdminForm(false)}
                    >
                      Назад к регистрации артиста
                    </Button>
                  </form>
                )}
              
              {/* {!showAdminForm && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-sm text-muted-foreground hover:text-foreground mt-6 w-full rounded-xl"
                  onClick={() => setShowAdminForm(true)}
                >
                  регистрация администратора
                </Button>
              )} */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};