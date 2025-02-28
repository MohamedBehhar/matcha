import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function index() {
  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <h1 className="text-4xl font-bold">Google Auth Failed</h1>
      <p className="text-lg">Please try again later</p>
      <Button className="mt-4 bg-red-primary">
        <Link to="/signin">Sign In</Link>
      </Button>
    </div>
  );
}

export default index;
