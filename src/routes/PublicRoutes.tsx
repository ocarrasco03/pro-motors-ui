import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import type { JSX } from "react";

export const PublicRoutes = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isBootstrapping } = useAppSelector(
    (state) => state.auth,
  );

  if (isBootstrapping) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};
