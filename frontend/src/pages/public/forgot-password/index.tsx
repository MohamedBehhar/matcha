import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/api/methods/auth";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Index() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
      toast.success("Reset link sent to your email.");
    } catch {
      toast.error("Failed to send reset email. Check your email address.");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="container flex flex-col items-center justify-center h-screen gap-4 text-center">
        <h1 className="text-2xl font-bold text-red-primary p-8">
          An email has been sent to your email address with instructions on how
          to reset your password.
        </h1>
        <p className="text-m text-gray-400">
          Please check your email and follow the instructions.
        </p>
        <Link to="/" className="text-red-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center h-screen gap-4 px-4">
      <h1 className="text-2xl font-bold text-red-primary text-center">
        Reset your password
      </h1>
      <p className="text-gray-400 text-center">
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <Link to="/" className="text-red-primary hover:underline text-sm">
        Back to sign in
      </Link>
    </div>
  );
}

export default Index;
