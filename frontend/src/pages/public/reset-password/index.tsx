import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/api/methods/auth";
import { useNavigate } from "react-router";
import { error } from "console";

function index() {
  const navigate = useNavigate();
  const [errors, setErrors] = React.useState<string | null>(null);
  const handelResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    if (!password || password.length < 6) {
      setErrors("Password must be at least 6 characters long");
      return;
    }
    const confirm_password = formData.get("confirm_password") as string;
    if (password !== confirm_password) {
      setErrors("Passwords do not match");
      return;
    }
    const token = window.location.pathname.split("/")[2];
    try {
      await resetPassword(password, token);
      navigate("/");
    } catch (error: any) {
      setErrors(
        error?.response?.data?.message ||
          "An error occurred while resetting password"
      );
    }
  };

  return (
    <div
      className="
	  container
	  flex
	  flex-col
	  items-center
	  justify-center
	  h-screen gap-4"
    >
      <h1 className=" text-2xl  font-bold text-red-primary">Reset Password</h1>
      <form
        onSubmit={handelResetPassword}
        className="flex flex-col gap-4 w-[300px]"
      >
        <label htmlFor="password">Password</label>
        <Input type="password" name="password" id="password" />
        <label htmlFor="confirm_password">Confirm Password</label>
        <Input type="password" name="confirm_password" id="confirm_password" />

        <Button type="submit" className="bg-red-primary text-white">
          Reset Password
        </Button>
      </form>
      {errors && <p className="text-sm text-red-500">{errors}</p>}
    </div>
  );
}

export default index;
