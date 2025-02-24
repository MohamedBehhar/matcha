import { Link } from "react-router-dom";
import { Button } from "../ui/button";
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
import { IoIosSettings } from "react-icons/io";
import { FaHeartbeat } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { IoChatbubbleSharp } from "react-icons/io5";
import { useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const { user } = useUserStore();
  const [notifications, setNotifications] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0);


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
  }, [user?.id]); // Runs only when user.id is available

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
  }, [user?.id]);

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
      {user?.id ? (
        <header className="  relative w-[70px]  h-screen  ">
          <nav className="flex flex-col absolute left-0 top-5  w-full h-full ">
            <ul className="flex flex-col gap-5 [&>*:hover]:text-primary [&>*]:transition-colors font-semibold  items-center text-gray-300">
              <li>
                <Link
                  to="/profile"
                  className={
                    location.pathname === "/profile" ? "text-red-primary" : ""
                  }
                >
                  {user?.profile_picture ? (
                    <img
                      src={`http://localhost:3000/${user?.profile_picture}`}
                      className="w-10 h-10 rounded-full border object-cover"
                      onError={(e) => {
                        e.currentTarget.src = userImg;
                      }}
                      alt="User Profile"
                    />
                  ) : (
                    <FaUserCircle size={24} />
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="/profile-settings"
                  className={
                    location.pathname === "/profile-settings"
                      ? "text-red-primary scale-110"
                      : ""
                  }
                >
                  <IoIosSettings size={24} />
                </Link>
              </li>
              <li>
                <Link
                  to="/match-making"
                  className={
                    location.pathname === "/match-making"
                      ? "text-red-primary scale-110"
                      : ""
                  }
                >
                  <FaHeartbeat size={24} />
                </Link>
              </li>
              <li>
                <Link
                  to="/notifications"
                  className={
                    location.pathname === "/notifications"
                      ? "text-red-primary scale-110"
                      : ""
                  }
                >
                  <IoMdNotifications size={24} />
                </Link>
              </li>
              <li>
                <Link
                  to="/chat"
                  className={
                    location.pathname === "/chat"
                      ? "text-red-primary scale-110"
                      : ""
                  }
                >
                  <IoChatbubbleSharp size={24} />
                </Link>
              </li>
              <li>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="bg-red-primary text-white p-2 aspect-square rounded-full cursor-pointer mt-10"
                >
                  <FaPowerOff size={14} />
                </Button>
              </li>
            </ul>

            {/* <ThemeSwitcher /> */}

            {/* Notifications Dropdown */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center justify-center cursor-pointer relative">
                  {notificationsCount > 0 && (
                    <div className="circle bg-red-500 w-4 absolute top-1 left-4 aspect-square rounded-[50%]">
                      <p className="text-xs flex justify-center items-center h-full">
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
            </DropdownMenu> */}
            {/* Logout Button */}
          </nav>
          <Toaster /> {/* Added Toaster for toast notifications */}
        </header>
      ) : null}
    </>
  );
}
