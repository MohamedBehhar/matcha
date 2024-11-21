import { Link } from "react-router-dom";
import { ThemeSwithcer } from "../theme-switcher/inddex";
import { Button } from "../ui/button";
import useUserStore from "@/store/userStore";
import { socket } from "@/utils/socket";
import { useEffect } from "react";
import { CiBellOn } from "react-icons/ci";
import toast, { Toaster } from "react-hot-toast";
import {
  getNotifications,
  getNotificationsCount,
} from "@/api/methods/notifications";
import { useState } from "react";

export default function Header() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const [notifications, setNotifications] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const id = localStorage.getItem("id") || "";

  useEffect(() => {
    socket.emit("join", id);
  }, [id]);

  const fetchNotifications = async () => {
    const notifications = await getNotifications(id);
    setNotifications(notifications);
  };

  const fetchNotificationsCount = async () => {
    const count = await getNotificationsCount(id);
    setNotificationsCount(count.count);
  };

  useEffect(() => {
    fetchNotifications();
    fetchNotificationsCount();
  }, []);

  useEffect(() => {
    socket.on("disconnect", () => {});
    socket.on("like", (userId: string) => {
      toast("User liked you: " + userId);
    });
    socket.on("match", (userId: string) => {
      alert(`User ${userId} matched with you`);
    });

    socket.on("notification", () => {
      alert("New notification");
      fetchNotifications();
      fetchNotificationsCount();
    });

    return () => {
      socket.off("disconnect");
      socket.off("like");
      socket.off("match");
      socket.off("notification");
    };
  }, []);

  return (
    <header>
      <nav className="h-[4rem] border-b px-container flex justify-between items-center">
        <ul className="flex gap-4 [&>*:hover]:text-primary [&>*]:transition-colors font-semibold">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/profile-settings">Settings</Link>
          </li>
          <li>
            <Link to="/match-making">Match Making</Link>
          </li>
        </ul>
        <ThemeSwithcer />
        <Toaster />
        <div className="flex items-center justify-center cursor-pointer  relative">
          {notificationsCount > 0 && (
            <div className="circle bg-red-500 w-4 absolute top-1 left-4 aspect-square rounded-[50%]">
              <p className=" text-xs flex justify-center items-center h-full">
                {notificationsCount}
              </p>
            </div>
          )}
          <CiBellOn size={32} />
        </div>
        <Button
          className="bg-red-primary text-white"
          onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            logout();
            window.location.href = "/signin";
          }}
        >
          Logout
        </Button>
      </nav>
    </header>
  );
}
