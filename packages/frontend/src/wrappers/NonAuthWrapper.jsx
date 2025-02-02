import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth";

export const NonAuthWrapper = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default NonAuthWrapper;
