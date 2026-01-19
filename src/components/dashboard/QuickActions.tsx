import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Upload,
  FileText,
  Package,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  path: string;
  color: string;
  permission?: string;
}

const quickActions: QuickAction[] = [
  {
    icon: Search,
    label: 'Buscar Autopartes',
    description: 'Buscar por número de parte o vehículo',
    path: '/search',
    color: 'from-violet-500 to-purple-600',
    permission: 'search_parts',
  },
  {
    icon: Plus,
    label: 'Nuevo Producto',
    description: 'Agregar producto al catálogo',
    path: '/products/new',
    color: 'from-emerald-500 to-teal-600',
    permission: 'edit_products',
  },
  {
    icon: Upload,
    label: 'Importar Datos',
    description: 'Importar desde CSV o Excel',
    path: '/import-export',
    color: 'from-blue-500 to-cyan-600',
    permission: 'import_export',
  },
  {
    icon: FileText,
    label: 'Lista de Precios',
    description: 'Gestionar listas de precios',
    path: '/price-lists',
    color: 'from-amber-500 to-orange-600',
    permission: 'manage_price_lists',
  },
];

const QuickActions: React.FC = () => {
  const filteredActions = quickActions.filter(
    (action) => !action.permission || []
  );

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredActions.map((action, index) => (
          <Link
            key={action.label}
            to={action.path}
            className="group relative overflow-hidden rounded-xl p-4 border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br',
                action.color
              )}
            />
            <div className="relative flex items-start gap-4">
              <div
                className={cn(
                  'p-3 rounded-xl bg-gradient-to-br text-white shadow-lg',
                  action.color
                )}
              >
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">{action.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
