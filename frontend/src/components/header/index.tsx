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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,

  DropdownMenuTrigger,
} from "@/components/ui/dropDown";
import { FaPowerOff } from "react-icons/fa6";
import { getUser } from "@/api/methods/user";

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
    getUser();
    fetchNotifications();
    fetchNotificationsCount();
  }, []);

  useEffect(() => {
    socket.on("disconnect", () => {});
    socket.on("like", (userId: string) => {
      toast("User liked you: " + userId);
    });
    socket.on("match", (user: any) => {
      toast("User matched with you: " + userId);
    });

    socket.on("notification", (data: any) => {
      fetchNotifications();
      fetchNotificationsCount();
      console.log("notification", data);
    });

    return () => {
      socket.off("disconnect");
      socket.off("like");
      socket.off("match");
      socket.off("notification");
    };
  }, []);

  return (
    <header className="border-b ">
      <nav className="h-[4rem] container flex justify-between items-center">
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

        <DropdownMenu>
          <DropdownMenuTrigger>
            {" "}
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
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id}>
                  {notification.content}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem>No notifications</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <h1
          className="text-xl font-bold capitalize"
        >{localStorage.getItem('name')}</h1>
        <Button
          className="bg-red-primary text-white rounded-full"
          onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            logout();
            window.location.href = "/signin";
          }}
        >
          <FaPowerOff  />
        </Button>
      </nav>
    </header>
  );
}
