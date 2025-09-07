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
    recipient_id: string,
    content: string,
    sender_id: string,
    notification_type: string
  ): Promise<void> {
    const newNotification = await orm.querySql(
      `INSERT INTO notifications (recipient_id, content, sender_id, notification_type)
SELECT $1, $2, $3, $4
WHERE NOT EXISTS (
  SELECT 1 FROM notifications 
  WHERE recipient_id = $1 AND content = $2 AND sender_id = $3 AND notification_type = $4
)
RETURNING *;
`,
      [recipient_id, content, sender_id, notification_type]
    );

    const receiver_id = await getSocketIdsByUserId(recipient_id);
    if (receiver_id) {
      this.socket?.to(receiver_id).emit("notification");
    }

    return;
  }

  public async getNotifications(recipient_id: string): Promise<Notification[]> {
    try {
      const notifications = await orm.querySql(
        `
        SELECT *
        FROM notifications n
        WHERE n.recipient_id = $1
          AND NOT EXISTS (
            SELECT 1
            FROM user_interactions ui
            WHERE ui.interaction_type = 'block'
              AND (
                (ui.user_id = n.sender_id AND ui.target_user_id = $1)
                OR (ui.user_id = $1 AND ui.target_user_id = n.sender_id)
              )
          )
        ORDER BY n.created_at DESC
        `,
        [recipient_id]
      );

      console.log("notifications==> ", notifications);
      return notifications;
    } catch (error) {
      console.log("error", error);
    }
    return [];
  }

  public async getNotificationsCount(recipient_id: string): Promise<number> {
    try {
      const notifications = await orm.findMany("notifications", {
        where: { recipient_id, is_read: false },
      });
      return notifications.length;
    } catch (error) {
      console.error("Error in getNotificationsCount:", error);
      throw new Error("Failed to fetch notifications count");
    }
  }

  public async markAsRead(recipient_id: string): Promise<void> {
    await orm.querySql(
      `UPDATE notifications SET is_read = true WHERE recipient_id = $1`,
      [recipient_id]
    );
    return;
  }
}

export default new NotificationsServices();
