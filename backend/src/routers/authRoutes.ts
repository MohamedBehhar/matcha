import { Router } from "express";
import authControllers from "../controllers/authControllers";

const router = Router();

// Connect the controller to the route
router.post("/signup", authControllers.signUp);

export default router;
