import {
  getNotifications,
  markAsRead,
  getNotificationsCount,
} from "@/api/methods/notifications";
import { useEffect, useState } from "react";
import useUserStore from "@/store/userStore";
import { FaBell, FaBellSlash, FaCheck, FaTrash } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUserStore();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        if (!user.id) {
          setLoading(false);
          return;
        }
        const [notificationsData, countData] = await Promise.all([
          getNotifications(user.id.toString()),
          getNotificationsCount(user.id.toString()),
        ]);

        setNotifications(notificationsData);
        await handleMarkAsRead();
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const navigate = useNavigate();

  const handleMarkAsRead = async () => {
    if (!user?.id) return;

    try {
      await markAsRead(user.id.toString());
    } catch (err) {
      toast.error("Failed to mark notifications as read");
    }
  };

  type Notification = {
    id: number;
    user_id: number;
    sender_id: number;
    content: string;
    notification_type: string;
    created_at: string;
    is_read?: boolean;
  };

  return (
    <div className="dark px-4 py-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaBell className="text-red-primary" />
            Notifications
          </h1>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-primary"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FaBellSlash className="text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
              No notifications yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              When you receive notifications, they'll appear here
            </p>
          </div>
        )}

        {/* Notifications list */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all flex justify-between items-center  ${
                  notification.is_read
                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                } hover:shadow-sm`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {notification.notification_type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                {(notification.notification_type == "like" || notification.notification_type == "visit") && (
                  <Button
                    onClick={() => {
                      navigate(`/profile/${notification.sender_id}`);
                    }}
                  >
                    View Porfile
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationPage;
