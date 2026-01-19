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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authThunks';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || []
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden animate-fade-in"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-72 bg-sidebar lg:hidden animate-slide-in-left">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-20 items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
              <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">Pro Motors</span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {user.first_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user.first_name}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
                </div>
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
                  onClick={onClose}
                  className={cn('nav-item', isActive && 'active')}
                >
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-inherit')} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <button
              onClick={() => {
                onClose();
                dispatch(logout());
              }}
              className="nav-item w-full text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
