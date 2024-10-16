import React, { useEffect } from "react";
import { verifyEmail } from "@/api/methods/auth";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
function index() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    setIsLoading(true);
    console.log(token);
    verifyEmail(token || "")
      .then((res) => {
        console.log(res);
        localStorage.setItem("access_token", res.access_token);
        localStorage.setItem("refresh_token", res.refresh_token);
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
        window.location.href = "/signin";
      });
    setIsLoading(false);
  }, []);
  return (
    <div className="container flex flex-col items-center justify-center h-screen ">
      <h1 className="text-3xl font-semibold text-center">Verify Email</h1>
      <p className="text-center text-red-primary">
        Your email is being verified.
      </p>
      <p>{isLoading ? "Loading..." : "Verifying email..."}</p>
    </div>
  );
}

export default index;
