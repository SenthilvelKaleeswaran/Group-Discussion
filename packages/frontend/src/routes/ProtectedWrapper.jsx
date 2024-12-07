import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth";

const ProtectedWrapper = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedWrapper;
