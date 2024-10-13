import { Router } from "express";
import authControllers from "../controllers/authControllers";

const router = Router();

// Connect the controller to the route
router.post("/signup", authControllers.signUp);
router.post("/signin", authControllers.signIn);
router.post("/refresh", authControllers.refresh);
router.get("/verify", authControllers.verifyEmail);

export default router;
