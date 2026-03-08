import { Router } from "express";
import msgsControllers from "../controllers/msgsControllers";
const router = Router();

router.get("/get-msgs/:user_id", msgsControllers.getMsgs);
router.get("/get-msgs-count/:user_id", msgsControllers.getMsgsCount);
router.post("/save-msgs", msgsControllers.saveMsgs);
// Use PUT with no body to avoid validation error on empty POST body
router.put("/mark-as-read/:user_id", msgsControllers.markAsRead);
router.get("/get-conversations/:user_id", msgsControllers.getConversations);
router.get("/get-msgs-by-conversation/:conversation_id", msgsControllers.getMsgsByConversationId);
export default router;
