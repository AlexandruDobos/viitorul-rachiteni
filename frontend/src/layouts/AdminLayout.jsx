import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Layout pentru zona de admin – container centrat, fără overflow orizontal.
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      <div className="w-full max-w-none px-3 lg:px-8">
        <Outlet />
      </div>
    </div>

  );
}
