import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SignupImg from "@/assets/images/signupImg.svg?react";
import { signIn } from "@/api/methods/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function index() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
      console.log(response);
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      navigate("/");
    } catch (error) {
      console.error("889889", error.response.data);
      setError(error.response.data);
    }
    setIsLoading(false);
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
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            className="mb-4"
          />
          <Button type="submit" className="w-full bg-red-primary text-white">
            {isLoading ? "Loading..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default index;
