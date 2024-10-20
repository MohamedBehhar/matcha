import { Router } from "express";
import tagsControllers from "../controllers/interestControllers";

const router = Router();

// Define a route for the tags, and use the controller's function
router.get("/", tagsControllers.returnTags); 

export default router;
