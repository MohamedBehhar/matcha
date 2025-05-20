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
  const emailRef = React.useRef<HTMLInputElement>(null);

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
        navigate("/match-making");
      } else {
        navigate("/complete-profile");
      }
    } catch (error) {
      setError(error.response.data);
    }
    setIsLoading(false);
  };

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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-black-primary">
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <div className="flex flex-col lg:flex-row items-center w-full max-w-5xl bg-black-secondary rounded-lg p-6 gap-8">
        {/* Animated Signup Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            scale: { type: "spring", stiffness: 120, damping: 10 },
          }}
          className="w-full  max-w-[400px] "
        >
          <SignupImg className="w-full " />
        </motion.div>

        {/* Animated Form */}
        <motion.form
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="w-full max-w-[450px]   flex flex-col items-center gap-4"
        >
          <Input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full"
            onChange={(e) => setEmail(e.target.value)}
            ref={emailRef}
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleForgotPassword}
            className="text-red-primary text-sm hover:underline self-end"
          >
            Forgot Password?
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-red-primary text-white py-2 rounded-md"
          >
            {isLoading ? <HeartLoader /> : "Sign In"}
          </motion.button>

          {/* Divider */}
          <div className="w-full  h-px bg-gray-700 my-2"></div>

          <div className="flex flex-col max-w-[300px] sm:max-w-[unset] md:flex-row items-center justify-center w-full gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-600 py-2 px-4 rounded-md"
            >
              <a
                href="http://localhost:3000/api/auth/google"
                className="flex items-center gap-2"
              >
                <FcGoogle size={20} /> Sign In with Google
              </a>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="w-full md:w-auto border border-red-primary text-red-primary font-semibold py-2 px-4 rounded-md"
            >
              <Link to="/signup">Sign Up</Link>
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default index;
