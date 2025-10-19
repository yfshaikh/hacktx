import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Bot, Settings } from 'lucide-react';

function AppSidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    {
      title: 'Avatar',
      icon: Bot,
      path: '/avatar',
    },
  ];

  // Get user display name
  const userDisplayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email;

  return (
    <Sidebar className="border-r border-[var(--border)]">
      <SidebarHeader className="border-b border-[var(--border)] p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--toyota-red)] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)] text-base">Toyota AI</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Assistant</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="border-r border-[var(--border)]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-[var(--muted-foreground)] px-4 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.path)}
                    className="transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-r border-[var(--border)] p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => navigate('/settings')} 
              className="w-full transition-colors py-7 px-2"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--toyota-red)] to-[var(--toyota-red-dark)] flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                    {userDisplayName}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">
                    {userEmail}
                  </p>
                </div>
                <Settings className="w-5 h-5 text-[var(--muted-foreground)] flex-shrink-0" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[var(--background)]">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <div className="border-b border-[var(--border)] py-4 px-4 bg-[var(--card)]">
            <SidebarTrigger className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50" />
          </div>
          <div className="flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default Layout;

