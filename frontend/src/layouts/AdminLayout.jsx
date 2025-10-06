import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Layout pentru zona de admin – container centrat, fără overflow orizontal.
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      {/* container sigur pe mobil */}
      <div className="mx-auto w-full max-w-screen-sm px-3 sm:px-4">
        <Outlet />
      </div>
    </div>
  );
}
