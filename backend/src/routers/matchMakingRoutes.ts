import { Router } from "express";
import matchMakingControllers from "../controllers/matchMakingControllers";
const router = Router();

router.post("/like", matchMakingControllers.likeAUser);
router.post("/unlike", matchMakingControllers.unlikeAUser);
router.get("/matches", matchMakingControllers.getMatches);

export default router;