import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authThunks';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isSidebarCollapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Stock bajo', message: 'Filtro de aceite 5W-30 tiene stock bajo', type: 'warning', time: '5 min' },
    { id: 2, title: 'Importación completada', message: 'Se importaron 234 productos exitosamente', type: 'success', time: '1 hora' },
    { id: 3, title: 'Nuevo precio', message: 'Lista de precios actualizada por Proveedor ABC', type: 'info', time: '2 horas' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-20 bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300',
        isSidebarCollapsed ? 'left-20' : 'left-72',
        'max-lg:left-0'
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl w-80 cursor-pointer hover:bg-muted/80 transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Buscar productos, partes...</span>
            <kbd className="ml-auto text-xs bg-background px-2 py-1 rounded-lg border border-border text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="rounded-xl relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-fade-in">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Notificaciones</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full mt-2',
                              notification.type === 'warning' && 'bg-warning',
                              notification.type === 'success' && 'bg-success',
                              notification.type === 'info' && 'bg-info'
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border">
                    <Button variant="ghost" className="w-full text-primary">
                      Ver todas las notificaciones
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 pr-4 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                {user?.first_name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.first_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-fade-in">
                  <div className="p-2">
                    <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors text-left">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <span>Mi perfil</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors text-left">
                      <Settings className="w-5 h-5 text-muted-foreground" />
                      <span>Configuración</span>
                    </button>
                    <hr className="my-2 border-border" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        dispatch(logout())
                      }}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-destructive/10 transition-colors text-left text-destructive"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
