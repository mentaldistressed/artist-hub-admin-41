import { Users, DollarSign, Settings, LogOut } from 'lucide-react';
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
  { title: 'финансы', url: '/finances', icon: DollarSign, role: 'artist' },
];

const adminItems: NavItem[] = [
  { title: 'пользователи', url: '/users', icon: Users, role: 'admin' },
  { title: 'финансы', url: '/admin-finances', icon: DollarSign, role: 'admin' },
  { title: 'настройки', url: '/settings', icon: Settings, role: 'admin' },
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
    isActive ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar
      className={collapsed ? 'w-14' : 'w-64'}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-sm font-medium text-muted-foreground">
            {!collapsed && (
              profile?.role === 'admin' ? 'панель администратора' : 'панель артиста'
            )}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
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
            <div className={`px-2 py-2 ${collapsed ? 'text-center' : ''}`}>
              {!collapsed && (
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {profile?.role === 'admin' ? profile?.name : profile?.pseudonym}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.role === 'admin' ? 'администратор' : 'артист'}
                  </p>
                </div>
              )}
              
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size={collapsed ? "icon" : "sm"}
                className={`mt-2 ${collapsed ? 'w-8 h-8' : 'w-full justify-start'}`}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span className="ml-2">выйти</span>}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}