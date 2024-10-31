// geolocationRoutes.js
import { Router } from "express";
import geolocationControllers from "../controllers/geolocationControllers";
const router = Router();

// Define the route without template literals for query parameters
router.get("/get-users-under-radius", geolocationControllers.getUsersUnderRadius);

export default router;
