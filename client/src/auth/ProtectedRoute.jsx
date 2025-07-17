import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { userRole } = useContext(AuthContext);
  const location = useLocation();

 console.log("🔒 ProtectedRoute → userRole:", userRole, "| allowedRole:", allowedRole);
 
  if (!userRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  
  if (userRole !== allowedRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  
  return children;
};

export default ProtectedRoute;
