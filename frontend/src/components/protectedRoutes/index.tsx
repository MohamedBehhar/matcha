import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUserStore from "@/store/userStore";

const ProtectedRoutes = () => {
  const { user } = useUserStore();
  const location = useLocation();

  if (!user?.id) {
    return <Navigate to="/signin" replace />;
  }

  if (!user?.is_data_complete) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (location.pathname === "/") {
    return <Navigate to="/match-making" replace />;
  }

  return <Outlet />;
};


export default ProtectedRoutes;
