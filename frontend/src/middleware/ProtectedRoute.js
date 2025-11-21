import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getAuthUser } from "../helper/Storage";

export const ProtectedRoute = ({ allowedTypes }) => {
  const auth = getAuthUser();

  if (!auth) {
    return <Navigate to="/login" />;
  }

  if (!allowedTypes.includes(auth.type)) {
    return <Navigate to="/not-authorized" />; // Redirect here
  }

  return <Outlet />;
};
