import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SignupImg from "@/assets/images/signupImg.svg?react";
import PeopleAround from "@/assets/images/people-around.svg?react";
import { signIn, forgotPassword } from "@/api/methods/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import useUserStore from "@/store/userStore";
function index() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const setUserInfos = useUserStore((state) => state.setUserInfos);
  const logUser = useUserStore((state) => state.logUser);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const signInInput = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    try {
      const response = await signIn(signInInput);
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      localStorage.setItem("name", response.username);
      localStorage.setItem("id", response.id);
      setUserInfos(response);
      logUser(response);
      if (response.isDataComplete) {
        navigate("/");
      } else {
        navigate("/profile-settings");
      }
    } catch (error) {
      setError(error.response.data);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    try {
      await forgotPassword(email);
      // redirect to forgot password page
      navigate("/forgot-password");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center h-screen ">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex items-center w-full p-4  rounded-md">
        <SignupImg className="flex-1 fill-red-primary" />
        <form onSubmit={handleSubmit} className="flex-1">
          <Input
            name="email"
            type="email"
            placeholder="Email"
            className="mb-4"
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            className=""
          />
          <button
            type="button"
            className="mb-4 text-red-primary text-sm bg-transparent p-0 hover:none"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
          <Button type="submit" className="w-full bg-red-primary text-white">
            {isLoading ? "Loading..." : "Sign In"}
          </Button>
        </form>
      </div>
      <div>
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="text-red-primary">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default index;
