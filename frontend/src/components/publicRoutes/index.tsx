import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "@/store/userStore";

const PublicRoutes = () => {
  const { user } = useUserStore();

  // ✅ Already authenticated → redirect based on profile completion
  if (user?.id) {
    if (!user.is_data_complete) {
      return <Navigate to="/complete-profile" replace />;
    }
    return <Navigate to="/match-making" replace />;
  }

  return <Outlet />;
};

export default PublicRoutes;