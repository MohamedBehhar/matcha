import orm from "../lib/orm";
import { Server } from "socket.io";

import notificationsEnum from "../types/notificationsType";
import { getSocketIdsByUserId } from "../utils/redis";

class NotificationsServices {
  private socket: Server | undefined;

  constructor() {
    this.createNotification = this.createNotification.bind(this);
    this.getNotifications = this.getNotifications.bind(this);
    this.getNotificationsCount = this.getNotificationsCount.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
  }

  public initSocket(io: Server) {
    this.socket = io;
  }

  public async createNotification(
    user_id: string,
    content: string,
    sender_id: string,
    notification_type: string
  ): Promise<void> {
    const newNotification = await orm.querySql(
      `INSERT INTO notifications (user_id, content, sender_id, notification_type)
SELECT $1, $2, $3, $4
WHERE NOT EXISTS (
  SELECT 1 FROM notifications 
  WHERE user_id = $1 AND content = $2 AND sender_id = $3 AND notification_type = $4
)
RETURNING *;
`,
      [user_id, content, sender_id, notification_type]
    );

    const receiver_id = await getSocketIdsByUserId(user_id);
    if (receiver_id) {
      this.socket?.to(receiver_id).emit("notification");
    }

    return;
  }

  public async getNotifications(user_id: string): Promise<Notification[]> {
    try {
      const notifications = await orm.findMany("notifications", {
        where: { user_id },
      });

      return notifications;
    } catch (error) {
      console.log("error", error);
    }
    return [];
  }

  public async getNotificationsCount(user_id: string): Promise<number> {
    try {
      const notifications = await orm.findMany("notifications", {
        where: { user_id },
      });
      return notifications.length;
    } catch (error) {
      console.error("Error in getNotificationsCount:", error);
      throw new Error("Failed to fetch notifications count");
    }
  }

  public async markAsRead(user_id: string): Promise<void> {
    await orm.update("notifications", user_id, { isRead: true });
    return;
  }
}

export default new NotificationsServices();
