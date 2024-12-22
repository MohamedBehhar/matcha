import { Router } from "express";
import matchMakingControllers from "../controllers/matchMakingControllers";
const router = Router();

router.post("/like", matchMakingControllers.likeAUser);
router.post("/unlike", matchMakingControllers.unlikeAUser);
router.post("/block", matchMakingControllers.blockAUser);
router.get("/matches", matchMakingControllers.getMatches);
router.get("/check-like/:user_id/:target_id", matchMakingControllers.checkLike);

export default router;