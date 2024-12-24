import orm from "../lib/orm";
import { Server } from "socket.io";

class NotificationsServices {
  private socket : Server | undefined;
  private userMap : Map<string, string> = new Map();

  constructor() {
    this.createNotification = this.createNotification.bind(this);
    this.getNotifications = this.getNotifications.bind(this);
    this.getNotificationsCount = this.getNotificationsCount.bind(this);
    this.markAsRead = this.markAsRead.bind(this);

  }

  public initSocket(io: Server, userMap: Map<string, string>) {
    this.socket = io;
    this.userMap = userMap;
  }

  public async createNotification(
    user_id: string,
    content: string,
    sender_id: string
  ): Promise<void> {
    const newNotification = await orm.create("notifications", {
      user_id,
      content,
      sender_id,
    });

    const receiver_id = this.userMap.get(user_id + "");
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
