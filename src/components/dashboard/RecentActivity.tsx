import React from 'react';
import { Package, Upload, AlertTriangle, DollarSign, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: number;
  type: 'product' | 'import' | 'alert' | 'price' | 'user';
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: 1,
    type: 'import',
    title: 'Importación completada',
    description: 'Se importaron 234 productos desde archivo CSV',
    time: 'Hace 5 minutos',
  },
  {
    id: 2,
    type: 'alert',
    title: 'Alerta de stock bajo',
    description: 'Filtro de aceite 5W-30 - Solo quedan 5 unidades',
    time: 'Hace 15 minutos',
  },
  {
    id: 3,
    type: 'price',
    title: 'Lista de precios actualizada',
    description: 'Proveedor ABC actualizó su lista de precios',
    time: 'Hace 1 hora',
  },
  {
    id: 4,
    type: 'product',
    title: 'Nuevo producto agregado',
    description: 'Pastillas de freno Brembo añadidas al catálogo',
    time: 'Hace 2 horas',
  },
  {
    id: 5,
    type: 'user',
    title: 'Nuevo usuario registrado',
    description: 'Juan Pérez se unió como vendedor',
    time: 'Hace 3 horas',
  },
];

const iconMap = {
  product: Package,
  import: Upload,
  alert: AlertTriangle,
  price: DollarSign,
  user: User,
};

const colorMap = {
  product: 'bg-primary/10 text-primary border-primary/20',
  import: 'bg-success/10 text-success border-success/20',
  alert: 'bg-warning/10 text-warning border-warning/20',
  price: 'bg-info/10 text-info border-info/20',
  user: 'bg-accent text-accent-foreground border-accent',
};

const RecentActivity: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn('p-2 rounded-xl border', colorMap[activity.type])}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
