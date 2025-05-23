import Header from "@/components/header";
import React from "react";
import { Outlet } from "react-router";
import { socket } from "@/utils/socket";
import { useEffect } from "react";
import useUserStore from "@/store/userStore";

function PrivateLayout() {
  const { user } = useUserStore();
  useEffect(() => {
    // socket.handshake.query i need the send user id
    // socket.auth = { user_id: user.id };
    socket.on("connect", () => {
      console.log("connected to socket", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("disconnected from socket", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.log("connect_error", err);
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div className="w-full h-screen flex gap-1">
      <Header />
      <div className="flex-1 h-full  overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default PrivateLayout;
