import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "@/store/userStore";

const ProtectedRoutes = () => {
  const { user } = useUserStore();

  if (!user?.id) {
    return <Navigate to="/" replace />;
  }

  if (!user?.is_data_complete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;