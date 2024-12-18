import React from "react";
import toast from "react-hot-toast";

function index({ message, type }: { message: string; type: string }) {
	console.log("message", message);
	console.log("type", type);
  return (
    <div>
      {type == "success" ? toast.success(message) : toast.error(message)}
    </div>
  );
}

export default index;
