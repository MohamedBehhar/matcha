import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SignupImg from "@/assets/images/signupImg.svg?react";
import { signIn, forgotPassword } from "@/api/methods/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useUserStore from "@/store/userStore";
import { useEffect } from "react";
import HeartLoader from "@/components/HeartLoader";
import { FcGoogle } from "react-icons/fc";
import { Toast } from "@/components/ui/toaster";
import toast from "react-hot-toast";

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
      localStorage.setItem("name", response.username);
      localStorage.setItem("id", response.id);
      setUserInfos(response);
      logUser(response);
      if (response.is_data_complete) {
        navigate("/");
      } else {
        navigate("/profile-settings");
      }
    } catch (error) {
      setError(error.response.data);
    }
    setIsLoading(false);
  };

  const emailRef = React.useRef<HTMLInputElement>(null);

  const handleForgotPassword = async () => {
    if (!email) {
      emailRef.current?.focus();
      return;
    }
    try {
      await forgotPassword(email);
      navigate("/forgot-password");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center h-screen  ">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex flex-col md:flex-row items-center  p-4 rounded-md w-full   ">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            scale: { type: "spring", stiffness: 120, damping: 10 },
          }}
          className="flex-1 "
        >
          <SignupImg className="w-full fill-red-primary" />
        </motion.div>

        <motion.form
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col items-center justify-center gap-2  w-96  p-4 rounded-md"
        >
          <Input
            name="email"
            type="email"
            placeholder="Email"
            className="mb-4"
            onChange={(e) => setEmail(e.target.value)}
            ref={emailRef}
          />

          <Input name="password" type="password" placeholder="Password" />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="mb-4 text-red-primary text-sm bg-transparent p-0 hover:none"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full max-w-[200px] bg-red-primary text-white py-2 rounded-md"
          >
            {isLoading ? <HeartLoader /> : "Sign In"}
          </motion.button>
        </motion.form>
      </div>
      <div className="flex flex-col   gap-4 sm:flex-row mt-20 sm:mt-0 items-center justify-center   w-full  ">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-full max-w-[200px] border border-white py-2 rounded-md  "
        >
          <a
            href="http://localhost:3000/api/auth/google"
            style={{
              color: "white",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <FcGoogle size={20} /> Sign In with Google
          </a>
        </motion.div>
        <div className="hidden  sm:visible   text-center text-gray-500">Or</div>

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-full max-w-[200px] border border-red-primary py-2 rounded-md text-center"
        >
          <Link to="/signup" className="text-red-primary font-semibold w-">
            Sign Up
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default index;
