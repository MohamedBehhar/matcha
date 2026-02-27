import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import SignupImg from "@/assets/images/signupImg.svg?react";
import { signIn } from "@/api/methods/auth";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useUserStore from "@/store/userStore";
import HeartLoader from "@/components/HeartLoader";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

function Index() {
  const [isLoading, setIsLoading] = useState(false);

  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await signIn({
        username: formData.get("username") as string,
        password: formData.get("password") as string,
      });

      setUser(response);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-black-primary">
      <div className="flex flex-col lg:flex-row items-center w-full max-w-5xl bg-black-secondary rounded-lg p-6 gap-8">

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            scale: { type: "spring", stiffness: 120, damping: 10 },
          }}
          className="w-full max-w-[400px]"
        >
          <SignupImg className="w-full" />
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="w-full max-w-[450px] flex flex-col items-center gap-4"
        >
          <Input
            name="username"
            type="text"
            placeholder="Username"
            className="w-full"
            autoComplete="username"
            required
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full"
            autoComplete="current-password"
            required
          />

          <Link
            to="/forgot-password"
            className="text-red-primary text-sm hover:underline self-end"
          >
            Forgot Password?
          </Link>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-primary text-white py-2 rounded-md"
          >
            {isLoading ? <HeartLoader /> : "Sign In"}
          </motion.button>

          <div className="w-full h-px bg-gray-700 my-2" />

          <div className="flex flex-col md:flex-row items-center justify-center w-full gap-4">
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              href="http://localhost:3000/api/auth/google"
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-600 py-2 px-4 rounded-md"
            >
              <FcGoogle size={20} /> Sign In with Google
            </motion.a>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-auto border border-red-primary text-red-primary font-semibold py-2 px-4 rounded-md text-center"
            >
              <Link to="/signup">Sign Up</Link>
            </motion.div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default Index;
