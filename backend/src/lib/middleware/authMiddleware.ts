import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../customError";
import authServices from "../../services/authServices";
import env from "../../utils/env";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("- - - - -  - - - -authMiddleware- - - -  -- - - -");
    const authHeader = req.headers.authorization as string;

    const token = authHeader.split(" ")[1].trim();
    console.log("token", token, typeof token);
    if (token == 'null' || token == 'undefined') {
        console.log("- - - - - - - - no token");
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
    req.headers.email = email;
    next();
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;
