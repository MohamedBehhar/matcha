import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getUser } from "@/api/methods/user";

const ProtectedRoutes = () => {
  const token = localStorage.getItem("access_token");
  if (token === null) {
    return <Navigate to="/" />;
  }
  const decoded = jwtDecode(token);
  const isExpired = decoded.exp * 1000 < Date.now();

  if (isExpired) {
    getUser();
  }

  const location = useLocation();
  if (token !== "undefined" && token !== null) {
    return <Outlet />;
  }

  return <Navigate to="/signin" state={{ from: location }} />;
};

export default ProtectedRoutes;
