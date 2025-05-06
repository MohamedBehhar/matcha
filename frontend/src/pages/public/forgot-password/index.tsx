import React from "react";

function index() {
  return (
    <div
      className="
	  container
	  flex
	  flex-col
	  items-center
	  justify-center
	  h-screen gap-4
	  text-center 
	  "
    >
      <h1 className="text-2xl font-bold text-red-primary p-8 ">
        An email has been sent to your email address with instructions on how to
        reset your password.
      </h1>
      <p className="text-m text-gray-400">
        Please check your email and follow the instructions.
      </p>
    </div>
  );
}

export default index;
