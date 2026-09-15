import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

interface RoleRouteProps {
  role: UserRole;
}

const RoleRoute = ({ role }: RoleRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;