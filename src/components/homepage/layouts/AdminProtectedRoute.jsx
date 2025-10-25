import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("user_role");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/"); 
    }
  }, [role, navigate]);

  if (role !== "admin") return null; 

  return <>{children}</>;
};

export default AdminProtectedRoute;
