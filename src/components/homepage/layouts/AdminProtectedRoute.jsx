import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("user_role");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/"); // redirect if not admin
    }
  }, [role, navigate]);

  if (role !== "admin") return null; // avoid flashing content before redirect

  return <>{children}</>;
};

export default AdminProtectedRoute;
