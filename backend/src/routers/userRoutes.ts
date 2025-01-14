import { Router } from "express";
import userControllers from "../controllers/userControllers";
import upload from "../lib/middleware/uploadMidelware"; // Assumes `uploadMiddleware` is configured

const router = Router();

router.get("/me", userControllers.me);
router.post("/", userControllers.create); // Image upload on create
router.patch("/:id", upload.single("profile_picture"), userControllers.update);
router.patch('/images/:id', upload.array('images'), userControllers.addImages);
router.get('/images/:id', userControllers.getUserImages);
router.delete("/:id", userControllers.delete);
router.delete("/images/delete/:id",  userControllers.deleteImage);
router.get("/:id", userControllers.getUsersById);
router.patch("/:id/location", userControllers.updateUserLocation);


export default router;
