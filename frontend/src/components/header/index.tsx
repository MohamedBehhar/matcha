import { Link } from "react-router-dom";
import { ThemeSwitcher } from "../theme-switcher/index"; // Fixed typo in import
import { Button } from "../ui/button";
import useUserStore from "@/store/userStore";
import { socket } from "@/utils/socket";
import { useEffect, useState } from "react"; // Combined imports
import { CiBellOn } from "react-icons/ci";
import toast, { Toaster } from "react-hot-toast";
import {
  getNotifications,
  getNotificationsCount,
} from "@/api/methods/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropDown"; // Fixed typo in import
import { FaPowerOff } from "react-icons/fa6";
import { getUser } from "@/api/methods/user";
import userImg from "@/assets/images/user.png";
import { logout } from "@/api/methods/auth";

export default function Header() {
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
      {user.id ? (
        <header className="border-b">
          <nav className="h-[4rem] container flex justify-between items-center">
            <Link to="/" className="flex items-center gap-4 cursor-pointer">
              <img
                src={`http://localhost:3000/${user?.profile_picture}`}
                className="w-10 h-10 rounded-full border object-cover"
                onError={(e) => {
                  e.currentTarget.src = userImg;
                }}
                alt="User Profile" // Added alt attribute for accessibility
              />
              <h1 className="text-xl font-bold capitalize">
                {user?.username || "Guest"}{" "}
                {/* Use user.name instead of localStorage */}
              </h1>
            </Link>
            <div className="flex gap-4 items-center">
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
              {/* <ThemeSwitcher /> */}

              {/* Notifications Dropdown */}
              <DropdownMenu>
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
              </DropdownMenu>

              {/* Logout Button */}
              <Button
                className="bg-red-primary text-white rounded-full"
                onClick={handleLogout}
              >
                <FaPowerOff />
              </Button>
            </div>
          </nav>
          <Toaster /> {/* Added Toaster for toast notifications */}
        </header>
      ) : null}
    </>
  );
}
