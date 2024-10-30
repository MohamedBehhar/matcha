import { Router } from "express";
import geolocationControllers from "../controllers/geolocationControllers";
const router = Router();

router.get("/get-users-under-radius?latitude=${latitude}&longitude=${longitude}&radius=${radius}", geolocationControllers.getUsersUnderRadius);
export default router;