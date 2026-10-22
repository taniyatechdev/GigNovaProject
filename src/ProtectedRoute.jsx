
import React from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useGigNova } from "./context/GigNovaContext";

export default function ProtectedRoute({
  children,
}) {
  const { user } = useGigNova();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return children;
}
