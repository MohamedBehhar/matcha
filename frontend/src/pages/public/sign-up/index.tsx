import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SignupImg from "@/assets/images/signupImg.svg?react";
import { signUp } from "@/api/methods/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

type FormErrors = {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  password?: string;
  general?: string;
};

function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  const validate = (data: any): FormErrors => {
    const errors: FormErrors = {};

    if (!data.first_name) errors.first_name = "First name is required";
    if (!data.last_name) errors.last_name = "Last name is required";
    if (!data.email) errors.email = "Email is required";
    if (!data.username) errors.username = "Username is required";
    if (!data.password || data.password.length < 6)
      errors.password = "Password must be at least 6 characters";

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const signUpInput = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    const validationErrors = validate(signUpInput);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      await signUp(signUpInput);
      toast.success("Account created successfully");
      navigate("/verify");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrors({
          general:
            err.response?.data?.message ||
            "Signup failed. Please try again.",
        });
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center h-screen">
      <div className="flex items-center w-full p-4 rounded-md">
        <SignupImg className="flex-1" />

        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <Input
            name="first_name"
            placeholder="First Name"
            error={errors.first_name}
          />

          <Input
            name="last_name"
            placeholder="Last Name"
            error={errors.last_name}
          />

          <Input
            name="email"
            type="email"
            placeholder="Email"
            error={errors.email}
          />

          <Input
            name="username"
            placeholder="Username"
            error={errors.username}
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            error={errors.password}
          />

          {errors.general && (
            <p className="text-red-600 text-sm">{errors.general}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Sign Up"}
          </Button>
        </form>
      </div>

      <div className="flex items-center gap-5 mt-6">
        <p>Already have an account?</p>
        <Button onClick={() => navigate("/")}>Sign In</Button>
      </div>
    </div>
  );
}

export default Index;
