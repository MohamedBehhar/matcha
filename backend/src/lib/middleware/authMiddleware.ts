import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../customError";
import authServices from "../../services/authServices";
import env from "../../utils/env";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("---- Auth Middleware ----");

    const token = req.cookies?.access_token; // ✅ Read from cookies
    if (!token) {
      console.log("No token found in cookies");
      throw new ForbiddenError("Forbidden");
    }

    const email = await authServices.verifyToken(
      token,
      env.JWT_SECRET as string,
      "access"
    );

    if (!email) {
      throw new UnauthorizedError("Unauthorized");
    }

    req.headers.email = email; // ✅ Attach email to request
    next(); // ✅ Proceed to next middleware

  } catch (err) {
    next(err);
  }
};

export default authMiddleware;
