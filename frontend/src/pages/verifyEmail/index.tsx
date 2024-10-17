import React from "react";

function index() {
  return (
    <div className="container flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-center text-primary">
        Account created successfully.
      </h1>
      <p className="text-center text-red-primary">
        Please verify your email address to continue.
      </p>
    </div>
  );
}

export default index;
