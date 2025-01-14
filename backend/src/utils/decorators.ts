import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../lib/customError";

type HandlerFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export function handleResponse() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        if ((req.method === "POST" || req.method === "PATCH") && !Object.keys(req.body).length && !req.files) {
          throw new ValidationError("Request body cannot be empty");
        }

        const result = await original.call(this, req, res, next);

        if (result instanceof Error) {
          return next(result);
        }

        let status = result?.status || (req.method === "POST" ? 201 : 200);

        const responseData = result?.data ?? result ?? {};

        if (responseData && typeof responseData === "object" && "password" in responseData) {
          delete responseData.password;
        }

        return res.status(status).send(responseData);
      } catch (error) {
        next(error);
      }
    };
    return descriptor;
  };
}

