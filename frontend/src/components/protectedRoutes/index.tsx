import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUserStore from "@/store/userStore";
import { useEffect, useState } from "react";

const ProtectedRoutes = () => {
  const { user, fetchUserData } = useUserStore();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserData();
      setLoading(false);
    };
    fetchData();
  }, [fetchUserData]);

  if (loading) {
    return <div>Loading...</div>; // Add a loading state
  }

  if (!user || !user.is_authenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (!user.is_data_complete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
