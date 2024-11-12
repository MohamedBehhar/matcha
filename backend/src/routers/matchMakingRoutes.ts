import { Router } from "express";
import matchMakingControllers from "../controllers/matchMakingControllers";
const router = Router();

router.post("/like", matchMakingControllers.likeAUser);

export default router;