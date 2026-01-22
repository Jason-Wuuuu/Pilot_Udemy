import { Outlet } from "react-router";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { useAppSelector } from "../store/hooks";

const AppLayout = () => {
    const user = useAppSelector((state) => state.auth.user);
    console.log("applayer",user);
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-6 py-8 overflow-y-auto h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
