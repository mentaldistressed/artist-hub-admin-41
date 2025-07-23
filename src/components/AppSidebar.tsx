import { Users, DollarSign, Settings, LogOut, Home, ChevronLeft, ChevronRight } from 'lucide-react';
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
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  { title: 'пользователи', url: '/users', icon: Users, role: 'admin' },
  { title: 'финансы', url: '/admin-finances', icon: DollarSign, role: 'admin' },
  { title: 'настройки', url: '/settings', icon: Settings, role: 'admin' },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const items = profile?.role === 'admin' ? adminItems : artistItems;
  const collapsed = state === 'collapsed';
  
  const isActive = (path: string) => currentPath === path;

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    const name = profile?.role === 'admin' ? profile?.name : profile?.pseudonym;
    return name ? name.split(' ').map(word => word[0]).join('').toUpperCase() : '?';
  };

  const getUserName = () => {
    return profile?.role === 'admin' ? profile?.name : profile?.pseudonym;
  };

  const getRoleLabel = () => {
    return profile?.role === 'admin' ? 'администратор' : 'артист';
  };

  return (
    <Sidebar
      className={`transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-72'} border-r border-sidebar-border bg-gradient-to-b from-sidebar-background to-sidebar-background/80`}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border/50 px-3 py-4">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎵</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-sidebar-foreground">музыкальный лейбл</h2>
                <p className="text-xs text-sidebar-foreground/60">{getRoleLabel()}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs font-medium text-sidebar-foreground/60 mb-3 ${collapsed ? 'sr-only' : ''}`}>
            навигация
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative
                          ${active 
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          }
                          ${collapsed ? 'justify-center' : ''}
                        `}
                      >
                        <item.icon className={`${collapsed ? 'h-5 w-5' : 'h-4 w-4'} flex-shrink-0`} />
                        {!collapsed && (
                          <span className="font-medium text-sm">{item.title}</span>
                        )}
                        {active && !collapsed && (
                          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary-foreground/80"></div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with user info */}
      <SidebarFooter className="border-t border-sidebar-border/50 p-3">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarImage src="" alt={getUserName()} />
            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {getUserName()}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {getRoleLabel()}
              </p>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={`
            mt-3 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive
            ${collapsed ? 'w-8 h-8' : 'w-full justify-start'}
          `}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2 text-sm">выйти</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}