import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoutes";
import { PublicRoutes } from "./PublicRoutes";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import MainLayout from "@/layout/MainLayout";
import NotFound from "@/pages/errors/NotFound";
import Products from "@/pages/products/Products";
import SearchParts from "@/pages/search/SearchParts";
import ComingSoon from "@/pages/errors/ComingSoon";
import ImportExport from "@/pages/import-exports/ImportExport";

export const AppRouter = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoutes>
            <LoginPage />
          </PublicRoutes>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="search" element={<SearchParts />} />
        <Route path="products" element={<Products />} />
        <Route
          path="price-lists"
          element={<ComingSoon title="Listas de Precios" description="Administra y versiona tus listas de precios para diferentes clientes y proveedores." />}
        />
        <Route
          path="suppliers"
          element={<ComingSoon title="Proveedores y Márgenes" description="Gestiona tus proveedores y configura márgenes de ganancia por línea de producto." />}
        />
        <Route
          path="import-export"
          element={<ImportExport />}
        />
        <Route
          path="users"
          element={<ComingSoon title="Usuarios" description="Administra usuarios, roles y permisos de tu organización." />}
        />
        <Route
          path="subscriptions"
          element={<ComingSoon title="Suscripciones" description="Gestiona planes de suscripción y facturación de tus clientes." />}
        />
        <Route
          path="notifications"
          element={<ComingSoon title="Notificaciones" description="Centro de notificaciones para alertas de stock, precios y más." />}
        />
        <Route
          path="settings"
          element={<ComingSoon title="Configuración" description="Personaliza tu experiencia y configura las opciones del sistema." />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
      
    </Routes>
  );
};
