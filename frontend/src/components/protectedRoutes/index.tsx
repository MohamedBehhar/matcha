import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser } from "@/api/methods/user";

const ProtectedRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getUser();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <p>Loading...</p>; // 👈 Show a loading state while checking auth
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" state={{ from: location }} />;
};

export default ProtectedRoutes;
