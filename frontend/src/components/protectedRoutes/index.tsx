import { Navigate, Outlet, useLocation } from "react-router-dom";
import CompleteProfile from "@/pages/completeProfile";
import useUserStore from "@/store/userStore";
import Header from "../header";

const ProtectedRoutes = () => {
  const { user } = useUserStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (!user.is_data_complete) {
    return <CompleteProfile />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
