import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "@/store/userStore";

const PublicRoutes = () => {
  const { user } = useUserStore();

  // ✅ Already authenticated → redirect away from auth pages
  if (user?.id) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoutes;
