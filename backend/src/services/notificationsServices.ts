import orm from "../lib/orm";

class NotificationsServices {
  constructor() {
    this.createNotification = this.createNotification.bind(this);
    this.getNotifications = this.getNotifications.bind(this);
    this.getNotificationsCount = this.getNotificationsCount.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
  }

  public async createNotification(
    user_id: string,
    message: string,
    sender_id: string
  ): Promise<void> {
    const newNotification = await orm.create("notifications", {
      user_id,
      message,
      sender_id,
    });
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
		where: { user_id  },
	  });

	  return notifications.length;
	} catch (error) {
	  console.log("error", error);
	}
	return 0;
  }

  public async markAsRead(user_id: string): Promise<void> {
    await orm.update("notifications", user_id, { isRead: true });
    return;
  }
}

export default new NotificationsServices();
