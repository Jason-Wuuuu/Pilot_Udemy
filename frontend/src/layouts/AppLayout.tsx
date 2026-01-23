import { Outlet } from "react-router";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false); // collapse state

  return (
    <div className="drawer drawer-mobile drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      {/* Sidebar wrapper */}
      <div
        className={`drawer-side h-screen transition-all duration-300 ${
          collapsed ? "25%" : "8%"
        }`}
      >
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main content */}
      <div className="drawer-content flex flex-col h-screen">
        <NavBar />

        <main className="flex-1 overflow-y-auto bg-base-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
