import { Router } from "express";
import AuthControllers from "../controllers/authControllers";
const router = Router();


// Connect the controller to the route
router.post("/signup", AuthControllers.signUp);
router.post("/signin", AuthControllers.signIn);
router.post("/refresh", AuthControllers.refresh);
router.post("/logout", AuthControllers.logout);
router.get("/verify/:token?", AuthControllers.verifyEmail);
router.post("/forgot-password", AuthControllers.forgotPassword);
router.post("/reset-password", AuthControllers.resetPassword);

router.get("/google", AuthControllers.googleLogin); // Initiate Google OAuth
router.get("/google/callback", AuthControllers.googleCallback); // Handle Google OAuth callback

export default router;
