import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Loading } from "../common/Loading";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = "/" }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading message="Loading..." />;
  }

  if (!user) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
}