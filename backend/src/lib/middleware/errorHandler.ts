import { Request, Response, NextFunction } from "express";
import { CustomError } from "../customError";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  console.error("❌ Unexpected error:", err);

  return res.status(500).json({
    error: "InternalServerError",
    message: "Something went wrong",
  });
}
