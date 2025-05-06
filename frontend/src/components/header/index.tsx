import { Link } from "react-router-dom";
import useUserStore from "@/store/userStore";
import { socket } from "@/utils/socket";
import { useEffect, useState } from "react"; // Combined imports
import toast, { Toaster } from "react-hot-toast";
import {
  getNotifications,
  getNotificationsCount,
} from "@/api/methods/notifications";

import { FaPowerOff } from "react-icons/fa6";
import { getUser } from "@/api/methods/user";
import userImg from "@/assets/images/user.png";
import { logout } from "@/api/methods/auth";

import { useLocation } from "react-router-dom";
import { headerData } from "./data";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function Header() {
  const location = useLocation();
  const { user, setUserInfos } = useUserStore();
  const [notifications, setNotifications] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUserInfos(userData); // Set user in store
      } catch (error) {
        console.error("Failed to fetch user:", error);
        toast.error("Failed to load user data.");
      }
    };

    fetchUser();
  }, [setUserInfos]);

  useEffect(() => {
    if (!user?.id) return; // Prevents API calls if user is not set

    const fetchNotificationsData = async () => {
      try {
        const [notifications, count] = await Promise.all([
          getNotifications(user.id),
          getNotificationsCount(user.id),
        ]);
        setNotifications(notifications);
        setNotificationsCount(count.count);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast.error("Failed to load notifications.");
      }
    };

    fetchNotificationsData();
  }, [user.id]); // Runs only when user.id is available

  // Socket listeners
  useEffect(() => {
    if (!user?.id) return;

    const handleLike = (userId: string) => {
      toast(`User liked you: ${userId}`);
    };

    const handleMatch = (matchedUser: any) => {
      toast(`User matched with you: ${matchedUser.id}`);
    };

    const handleNotification = () => {
      fetchNotifications();
      fetchNotificationsCount();
    };

    socket.emit("join", user.id);
    socket.on("like", handleLike);
    socket.on("match", handleMatch);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("like", handleLike);
      socket.off("match", handleMatch);
      socket.off("notification", handleNotification);
    };
  }, [user.id]);

  // Fetch notifications and count
  const fetchNotifications = async () => {
    try {
      const notifications = await getNotifications(user.id);
      setNotifications(notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications.");
    }
  };

  const fetchNotificationsCount = async () => {
    try {
      const count = await getNotificationsCount(user?.id);
      setNotificationsCount(count.count);
    } catch (error) {
      console.error("Failed to fetch notifications count:", error);
      toast.error("Failed to load notifications count.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
  };

  return (
    <>
      <header className="  relative w-[70px]  h-full p-1">
        <div className="flex flex-col gap-5 [&>*:hover]:text-primary [&>*]:transition-colors font-semibold  items-center text-gray-300  h-full py-4 shadow-lg  rounded-lg bg-red-primary/30 backdrop-blur-sm">
          <div className="flex flex-1 flex-col gap-5 items-center">
            {headerData.map(
              (item: {
                title: string;
                path: string;
                typeImg: string;
                icon: JSX.Element;
              }) => (
                <div key={item.title}>
                  <Link
                    to={item.path}
                    className={cn(
                      "[&>*]:transition-colors hover:bg-red-500 hover:[&>*]:text-red-primary",
                      {
                        "text-primary": location.pathname !== item.path,
                        "text-red-primary": item.title === "Matches",
                        "text-red-primary scale-110":
                          location.pathname === item.path,
                      }
                    )}
                  >
                    {item.typeImg === "img" ? (
                      <img
                        src={`http://localhost:3000/${user?.profile_picture}`}
                        className="w-10 h-10 rounded-full border object-cover"
                        onError={(e) => {
                          e.currentTarget.src = userImg;
                        }}
                        alt="User Profile"
                      />
                    ) : (
                      item.icon
                    )}
                  </Link>
                </div>
              )
            )}
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="bg-red-primary text-white p-2 aspect-square rounded-full cursor-pointer transition-transform duration-200 hover:scale-110 mt-auto  "
          >
            <FaPowerOff size={14} />
          </Button>
        </div>
      </header>
    </>
  );
}
