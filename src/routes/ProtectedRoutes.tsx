import type { JSX } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, isBootstrapping} = useAppSelector((state) => state.auth);

    if (isBootstrapping) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
}