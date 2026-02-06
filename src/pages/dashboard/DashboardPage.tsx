import { useAppSelector } from "@/app/hooks";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import StatCard from "@/components/dashboard/StatCard";
import StockAlerts from "@/components/dashboard/StockAlerts";
import React from "react";
import { Package, AlertTriangle, DollarSign, Truck } from "lucide-react";

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">
          Bienvenido, <span className="text-gradient">{user?.fullName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí está el resumen de tu negocio hoy.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        <StatCard
          title="Total de Productos"
          value="12,847"
          icon={Package}
          trend={{ value: 12, isPositive: true }}
          variant="gradient"
        />
        <StatCard
          title="Productos con Stock Bajo"
          value="23"
          icon={AlertTriangle}
          trend={{ value: 5, isPositive: false }}
          variant="warning"
        />
        <StatCard
          title="Valor del Inventario"
          value="$2.4M"
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Proveedores Activos"
          value="34"
          icon={Truck}
          trend={{ value: 2, isPositive: true }}
          variant="info"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 cols wide */}
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
        {/* Right Column */}
        <div className="space-y-6">
          <StockAlerts />

          {/* Notifications Preview */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Notificaciones</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm">3 nuevas notificaciones sin leer</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/5 border border-warning/10">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <p className="text-sm">Actualización de precios pendiente</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/10">
                <div className="w-2 h-2 rounded-full bg-success" />
                <p className="text-sm">Importación completada exitosamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
