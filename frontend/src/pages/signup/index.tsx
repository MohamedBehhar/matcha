import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SignupImg from "@/assets/images/signupImg.svg?react";
import { signUp } from "@/api/methods/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function index() {
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const signUpInput = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };
    try {
      const response = await signUp(signUpInput);
      console.log(response);
      navigate("/verify");
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <div className="container flex flex-col items-center justify-center h-screen ">
      <div className="flex items-center w-full p-4  rounded-md">
        <SignupImg className="flex-1 fill-red-primary" />
        <form onSubmit={handleSubmit} className="flex-1">
          <Input
            type="text"
            name="first_name"
            placeholder="First Name"
            className="mb-4"
          />
          <Input
            name="last_name"
            type="text"
            placeholder="Last Name"
            className="mb-4"
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            className="mb-4"
          />
          <Input
            name="username"
            type="text"
            placeholder="Username"
            className="mb-4"
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            className="mb-4"
          />
          <Button type="submit" className="w-full bg-red-primary text-white">
            {isLoading ? "Loading..." : "Sign Up"}
          </Button>
        </form>
      </div>
      <div className="flex items-center gap-5  ">
        <p>Already have an account?</p>
        <Button
          className=" bg-red-primary text-white"
          onClick={() => navigate("/signin")}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}

export default index;
