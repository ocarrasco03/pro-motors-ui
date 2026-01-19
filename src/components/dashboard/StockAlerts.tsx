import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StockAlert {
  id: number;
  partNumber: string;
  productName: string;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'critical';
}

const stockAlerts: StockAlert[] = [
  {
    id: 1,
    partNumber: 'FO-5W30-1L',
    productName: 'Filtro de aceite 5W-30 1L',
    currentStock: 5,
    minStock: 20,
    severity: 'critical',
  },
  {
    id: 2,
    partNumber: 'PF-BRM-001',
    productName: 'Pastillas de freno Brembo',
    currentStock: 12,
    minStock: 15,
    severity: 'low',
  },
  {
    id: 3,
    partNumber: 'BA-12V-60A',
    productName: 'Batería 12V 60Ah',
    currentStock: 3,
    minStock: 10,
    severity: 'critical',
  },
  {
    id: 4,
    partNumber: 'AM-K&N-001',
    productName: 'Filtro de aire K&N',
    currentStock: 8,
    minStock: 10,
    severity: 'low',
  },
];

const StockAlerts: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Alertas de Stock</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          Ver todo
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="space-y-3">
        {stockAlerts.map((alert, index) => (
          <div
            key={alert.id}
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md animate-fade-up',
              alert.severity === 'critical'
                ? 'bg-destructive/5 border-destructive/20'
                : 'bg-warning/5 border-warning/20'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                'p-2 rounded-xl',
                alert.severity === 'critical'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-warning/10 text-warning'
              )}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{alert.productName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {alert.partNumber} · Stock: {alert.currentStock}/{alert.minStock}
              </p>
            </div>
            <div
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-full',
                alert.severity === 'critical' ? 'badge-danger' : 'badge-warning'
              )}
            >
              {alert.severity === 'critical' ? 'Crítico' : 'Bajo'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockAlerts;
    