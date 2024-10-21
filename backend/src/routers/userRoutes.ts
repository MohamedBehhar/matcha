import { Router } from "express";
import userControllers from "../controllers/userControllers";
import authMiddleware from "../lib/middleware/authMiddleware";

const router = Router();

//// in case bghiti t exclude some routes from the middleware
// router.get("/me", userControllers.me);

router.use(authMiddleware);
router.get("/me", userControllers.me);
router.post("/", userControllers.create);
router.patch("/:id", userControllers.update);
router.delete("/:id", userControllers.delete);



export default router;
