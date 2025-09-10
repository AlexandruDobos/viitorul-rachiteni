// src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Layout gol pentru zona de admin.
 * Fără navbar, fără reclame, fără footer – doar conținutul admin pe tot ecranul.
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen w-full bg-white">
      <Outlet />
    </div>
  );
}
