import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VendorProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("user_role");

  useEffect(() => {
    if (role !== "vendor") {
      navigate("/"); // redirect if not vendor
    }
  }, [role, navigate]);

  if (role !== "vendor") return null;

  return <>{children}</>;
};

export default VendorProtectedRoute;
