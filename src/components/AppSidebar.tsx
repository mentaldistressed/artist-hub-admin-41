import { Users, DollarSign, Settings, LogOut, Home } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
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
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  title: string;
  url: string;
  icon: any;
  role?: 'artist' | 'admin';
}

const artistItems: NavItem[] = [
  { title: 'главная', url: '/', icon: Home, role: 'artist' },
  { title: 'финансы', url: '/finances', icon: DollarSign, role: 'artist' },
];

const adminItems: NavItem[] = [
  { title: 'главная', url: '/', icon: Home, role: 'admin' },
  { title: 'пользователи', url: '/admin-users', icon: Users, role: 'admin' },
  { title: 'финансы', url: '/admin-finances', icon: DollarSign, role: 'admin' },
  { title: 'настройки', url: '/admin-settings', icon: Settings, role: 'admin' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const items = profile?.role === 'admin' ? adminItems : artistItems;
  const collapsed = state === 'collapsed';
  
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-accent text-accent-foreground font-medium' 
      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar
      className={`${collapsed ? 'w-14' : 'w-64'} border-r border-border/50`}
      collapsible="icon"
    >
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {!collapsed && 'навигация'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                     <NavLink 
                       to={item.url} 
                       end 
                       className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm ${getNavCls({ isActive })}`}
                     >
                      <item.icon className="h-4 w-4" />
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
            <div className={`px-3 py-3 border-t border-border/50 ${collapsed ? 'text-center' : ''}`}>
              {!collapsed && (
                <div className="text-xs space-y-1 mb-3">
                  <p className="font-medium text-foreground">
                    {profile?.role === 'admin' ? profile?.name : profile?.pseudonym}
                  </p>
                  <p className="text-muted-foreground">
                    {profile?.role === 'admin' ? 'администратор' : 'артист'}
                  </p>
                </div>
              )}
              
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size={collapsed ? "icon" : "sm"}
                className={`${collapsed ? 'w-8 h-8' : 'w-full justify-start'} text-muted-foreground hover:text-foreground hover:bg-accent/50`}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span className="ml-2 text-sm">выйти</span>}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}