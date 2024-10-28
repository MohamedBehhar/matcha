import { Router } from "express";
import userControllers from "../controllers/userControllers";
import upload from "../lib/middleware/uploadMidelware"; // Assumes `uploadMiddleware` is configured

const router = Router();

router.get("/me", userControllers.me);
router.post("/", userControllers.create); // Image upload on create
router.patch("/:id", upload.single("profile_picture"), userControllers.update);
router.patch("/:id/interests", userControllers.addUserInterests);
router.delete("/:id", userControllers.delete);

export default router;
