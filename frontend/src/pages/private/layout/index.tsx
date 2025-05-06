import Header from "@/components/header";
import React from "react";
import { Outlet } from "react-router";

function PrivateLayout() {
  return (
    <div className="w-full h-screen flex gap-1">
      <Header />
      <div className="flex-1 h-full  overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default PrivateLayout;
