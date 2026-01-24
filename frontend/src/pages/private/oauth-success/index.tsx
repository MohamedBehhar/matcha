// src/pages/oauth-success.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/store/userStore";
import { getUser } from "@/api/methods/user";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    let isMounted = true;

    getUser()
      .then((res) => {
        if (!isMounted) return;

        setUser(res);

        navigate(
          res.is_data_complete
            ? "/match-making"
            : "/complete-profile",
          { replace: true }
        );
      })
      .catch(() => {
        navigate("/signin", { replace: true });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black-primary">
      <p className="text-white text-sm opacity-70">
        Finishing sign in…
      </p>
    </div>
  );
};

export default OAuthSuccess;
