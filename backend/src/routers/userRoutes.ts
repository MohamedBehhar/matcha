import { Router } from "express";
import userControllers from "../controllers/userControllers";
import upload from "../lib/middleware/uploadMidelware"; // Assumes `uploadMiddleware` is configured

const router = Router();

router.get("/me", userControllers.me);
router.post("/", upload.single("image"), userControllers.create); // Image upload on create
router.patch("/:id", upload.single("image"), userControllers.update); // Image upload on update
router.delete("/:id", userControllers.delete);

export default router;
