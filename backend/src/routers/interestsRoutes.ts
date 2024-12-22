import { Router } from "express";
import interestsControllers from "../controllers/interestsControllers";
const router = Router();

router.get("/get-interests", interestsControllers.getInterests);
router.get("/get-user-interests/:user_id", interestsControllers.getUserInterests);

export default router;