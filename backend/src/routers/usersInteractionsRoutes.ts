import { Router } from "express";
import userInteractionsControllers from "../controllers/userInteractionsControllers";
const router = Router();

router.post("/like", userInteractionsControllers.likeAUser);
router.post("/unlike", userInteractionsControllers.unlikeAUser);
router.post("/block", userInteractionsControllers.blockAUser);
router.get("/matches", userInteractionsControllers.getMatches);
router.get("/check-like/:user_id/:target_id", userInteractionsControllers.checkLike);
router.post('/visit', userInteractionsControllers.newVisit);

export default router;