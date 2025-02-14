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
    console.log("---- Auth Middleware ----");

    let accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token; // ✅ Get refresh token

    console.log("Cookies:", req.cookies);

    if (!accessToken) {
      console.log("No access token found, trying refresh token...");

      if (!refreshToken) {
        console.log("No refresh token found.");
        throw new ForbiddenError("Forbidden");
      }

      const email = await authServices.verifyToken(
        refreshToken,
        env.JWT_SECRET as string,
        "refresh"
      );

      if (!email) {
        console.log("Invalid refresh token.");
        throw new UnauthorizedError("Unauthorized");
      }

      console.log("Refresh token is valid. Generating new access token...");
      const tokens = await authServices.createTokens(email);

      res.cookie("access_token", tokens.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 15, // 15 minutes
      });

      accessToken = tokens.access_token; 
    }

    const email = await authServices.verifyToken(
      accessToken,
      env.JWT_SECRET as string,
      "access"
    );

    if (!email) {
      throw new UnauthorizedError("Unauthorized");
    }

    next(); 
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;
