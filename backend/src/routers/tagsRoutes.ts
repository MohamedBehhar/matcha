import { Router } from "express";
import tagsControllers from "../controllers/tagsControllers";

const router = Router();

router.get("/tags", tagsControllers.returnTags);

export default router;