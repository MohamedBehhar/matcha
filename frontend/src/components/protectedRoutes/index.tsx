import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoutes = () => {
  const token = localStorage.getItem("access_token");
  const location = useLocation();
  if (token !== "undefined" && token !== null) {
    return <Outlet />;
  }

  return <Navigate to="/signup" state={{ from: location }} />;
};

export default ProtectedRoutes;
