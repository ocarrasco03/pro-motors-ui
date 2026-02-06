import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Package,
  FileText,
  Truck,
  Upload,
  Users,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Car,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authThunks';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', permission: 'view_dashboard' },
  { icon: Search, label: 'Búsqueda', path: '/search', permission: 'search_parts' },
  { icon: Package, label: 'Productos', path: '/products', permission: 'view_products' },
  { icon: FileText, label: 'Listas de Precios', path: '/price-lists', permission: 'manage_price_lists' },
  { icon: Truck, label: 'Proveedores', path: '/suppliers', permission: 'manage_suppliers' },
  { icon: Upload, label: 'Importar / Exportar', path: '/import-export', permission: 'import_export' },
  { icon: Users, label: 'Usuarios', path: '/users', permission: 'manage_users' },
  { icon: CreditCard, label: 'Suscripciones', path: '/subscriptions', permission: 'manage_subscriptions' },
  { icon: Bell, label: 'Notificaciones', path: '/notifications', permission: 'view_notifications' },
  { icon: Settings, label: 'Configuración', path: '/settings', permission: 'manage_settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || []
  );

  const getRoleBadge = () => {
    switch (user?.roles[0].name) {
      case 'super-admin':
        return { label: 'Super Admin', color: 'bg-gradient-primary' };
      case 'admin':
        return { label: 'Admin', color: 'bg-success' };
      case 'manager':
        return { label: 'Gerente', color: 'bg-gradient-secondary' };
      case 'support':
        return { label: 'Soporte', color: 'bg-warning' };
      case 'supervisor':
        return { label: 'Supervisor', color: 'bg-gradient-secondary' };
      case 'user':
        return { label: 'Usuario', color: 'bg-info' };
      default:
        return { label: 'Usuario', color: 'bg-muted' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-sidebar-foreground">Pro Motors</span>
            )}
          </Link>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* User info */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                {user.firstName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.firstName}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-3">
              <span className={cn('text-xs font-medium px-2 py-1 rounded-full text-white', roleBadge.color)}>
                {roleBadge.label}
              </span>
              {user.company?.name && (
                <p className="text-xs text-sidebar-foreground/60 mt-2 truncate">
                  {user.company?.name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn('nav-item', isActive && 'active', isCollapsed && 'justify-center px-3')}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-inherit')} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={() => dispatch(logout())}
            className={cn(
              'nav-item w-full text-destructive hover:bg-destructive/10',
              isCollapsed && 'justify-center px-3'
            )}
            title={isCollapsed ? 'Cerrar sesión' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
