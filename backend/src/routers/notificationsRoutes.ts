import express from "express";
import notificationsController from "../controllers/notificationsController";

const router = express.Router();

router.get("/:user_id", notificationsController.getNotifications);

router.put("/:user_id", notificationsController.markAsRead);

router.get("/count/:user_id", notificationsController.getNotificationsCount);

export default router;
