import { Router } from "express";
import geolocationControllers from "../controllers/geolocationControllers";
const router = Router();


// Connect the controller to the route
router.get("/getUsersUnderRadius", geolocationControllers.getUsersUnderRadius);

export default router;