import { useEffect } from "react";
import { verifyEmail } from "@/api/methods/auth";
import { useParams, useNavigate } from "react-router-dom";

function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }

    verifyEmail(token)
      .then(() => {
        // ✅ ALWAYS go here
        navigate("/oauth-success", { replace: true });
      })
      .catch(() => {
        navigate("/signin", { replace: true });
      });
  }, [token]);

  return (
    <div className="container flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-semibold">Verify Email</h1>
      <p className="text-red-primary">Your email is being verified…</p>
    </div>
  );
}

export default VerifyEmailPage;
