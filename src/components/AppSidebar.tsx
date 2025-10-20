import { Users, Settings, LogOut, Home, FileText, Send, FileMusic, ArrowLeftRight } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  title: string;
  url: string;
  icon: any;
  role?: 'artist' | 'admin';
}

const artistItems: NavItem[] = [
  { title: 'Главная', url: '/', icon: Home, role: 'artist' },
  // { title: 'Релизы', url: '/releases', icon: FileMusic, role: 'artist'},
  { title: 'Отчёты', url: '/reports', icon: FileText, role: 'artist' }
];

const adminItems: NavItem[] = [
  { title: 'Главная', url: '/', icon: Home, role: 'admin' },
  { title: 'Пользователи', url: '/admin-users', icon: Users, role: 'admin' },
  { title: 'Релизы', url: '/releases', icon: FileMusic, role: 'admin'},
  { title: 'Мэтчинг авторских отчетов', url: '/match', icon: ArrowLeftRight, role: 'admin'},
  { title: 'Отчёты', url: '/admin-reports', icon: FileText, role: 'admin' },
  { title: 'Выплаты', url: '/admin-payouts', icon: Send, role: 'admin' },
  { title: 'Настройки', url: '/admin-settings', icon: Settings, role: 'admin' }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const items = profile?.role === 'admin' ? adminItems : artistItems;
  const collapsed = state === 'collapsed';
  
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-accent text-accent-foreground font-medium' 
      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground';

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    }
  };

  return (
    <Sidebar
      className={`${collapsed ? 'w-16' : 'w-72'} border-r border-border/30 bg-sidebar/95 backdrop-blur-xl`}
      collapsible="icon"
    >
      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {!collapsed && 'Навигация'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                     <NavLink 
                       to={item.url} 
                       end 
                       className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${getNavCls({ isActive })}`}
                     >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Информация о пользователе */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <div className={`px-4 py-4 border-t border-border/30 bg-gradient-to-r from-muted/30 to-transparent ${collapsed ? 'text-center' : ''}`}>
              {!collapsed && (
                <div className="text-sm space-y-1 mb-4">
                  <p className="font-semibold text-foreground tracking-tight">
                    {profile?.role === 'admin' ? profile?.name : profile?.pseudonym}
                  </p>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    {profile?.role === 'admin' ? 'Администратор' : 'Артист'}
                  </p>
                </div>
              )}
              
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size={collapsed ? "icon" : "default"}
                className={`${collapsed ? 'w-10 h-10 rounded-xl' : 'w-full justify-start rounded-xl'} text-muted-foreground hover:text-foreground hover:bg-accent/70 transition-all duration-200`}
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span className="ml-3 text-sm font-medium">Выйти из аккаунта</span>}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}