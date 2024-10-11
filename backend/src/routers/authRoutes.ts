import { Router, Request, Response } from "express";

const router = Router();

const signUp = async (req: Request, res: Response) => {
	  res.status(200).json({ message: "Sign up route" });
}

router.get("/signup", signUp);

export default router;
