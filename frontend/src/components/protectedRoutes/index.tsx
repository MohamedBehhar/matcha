import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUserStore from "@/store/userStore";
import { useEffect, useState } from "react";
import CompleteProfile from "@/pages/completeProfile";

const ProtectedRoutes = () => {
  const { user, fetchUserData } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUserData();
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !user.is_authenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // Redirect to complete profile if profile isn't completed
  if (!user.is_data_complete) {
    return (
      <Navigate to="/complete-profile" replace state={{ from: location }} />
    );
  }

  return <Outlet />; // If authenticated and profile is complete, show the requested page
};

export default ProtectedRoutes;
