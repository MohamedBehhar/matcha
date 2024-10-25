import { Router } from "express";
import interestsControllers from "../controllers/interestsControllers";
const router = Router();

router.get("/get-interests", interestsControllers.getInterests);

export default router;