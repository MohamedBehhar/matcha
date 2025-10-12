import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUserStore from "@/store/userStore";

const ProtectedRoutes = () => {
  const { user } = useUserStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }


  if (!user.is_data_complete && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }


  if (user.is_data_complete && location.pathname === "/complete-profile") {
    return <Navigate to="/match-making" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
