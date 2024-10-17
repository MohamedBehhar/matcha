import { Navigate, Outlet, useLocation } from "react-router-dom";

const getLocalStorage = async (key: string) => {
  const data = await localStorage.getItem(key);
  return data;
}

const ProtectedRoutes = () => {
  const token =  getLocalStorage("access_token");
  const location = useLocation();
  if (token !== "undefined" && token !== null) {
    return <Outlet />;
  }

  return <Navigate to="/signup" state={{ from: location }} />;
};

export default ProtectedRoutes;
