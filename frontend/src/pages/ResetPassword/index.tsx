import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/api/methods/auth";

function index() {
  const handelResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm_password = formData.get("confirm_password") as string;
    if (password !== confirm_password) {
      alert("Passwords do not match");
      return;
    }
    const token = window.location.pathname.split("/")[2];
    try {
      await resetPassword(password, token);
    } catch (error) {
      console.log(error);
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
    </div>
  );
}

export default index;
