import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "@/store/userStore";

const CompleteProfileRoute = () => {
  const { user } = useUserStore();

  // ⛔ Not logged in
  if (!user?.id) {
    return <Navigate to="/" replace />;
  }

  // ⛔ Profile already completed
  if (user.is_data_complete) {
    return <Navigate to="/match-making" replace />;
  }

  // ✅ Authenticated & incomplete
  return <Outlet />;
};

export default CompleteProfileRoute;
