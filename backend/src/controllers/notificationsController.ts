import { Request, Response } from "express";
import { handleResponse } from "../utils/decorators";
import notificationsServices from "../services/notificationsServices";

class NotificationsController {
  constructor() {
    this.getNotifications = this.getNotifications.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.getNotificationsCount = this.getNotificationsCount.bind(this);
  }

  @handleResponse()
  public async getNotifications(req: Request, res: Response) {
    const user_id = req.params.user_id;
    const notifications = await notificationsServices.getNotifications(user_id);
    return notifications as unknown as void;
  }

  @handleResponse()
  public async markAsRead(req: Request, res: Response) {
    const user_id = req.params.user_id;
    await notificationsServices.markAsRead(user_id);
    return { message: "Marked as read" } as unknown as void;
  }

  @handleResponse()
  public async getNotificationsCount(req: Request, res: Response) {
    const user_id = req.params.user_id;
    const count = await notificationsServices.getNotificationsCount(user_id);
    console.log("count", count);
    return {
      count,
    } as unknown as void;
  }
}

export default new NotificationsController();
