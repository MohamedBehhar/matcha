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
        // Validate the request body for POST and PATCH
        if ((req.method === "POST" || req.method === "PATCH") && !Object.keys(req.body).length) {
          throw new ValidationError("Request body cannot be empty");
        }

        // Call the original method and await its result
        const result = await original.call(this, req, res, next);

        // Handle error-like results
        if (result instanceof Error) {
          return next(result);
        }

        // Default status based on the HTTP method
        let status = result?.status || (req.method === "POST" ? 201 : 200);

        // Prepare the response data
        const responseData = result?.data ?? result ?? {};

        // Remove sensitive data like passwords
        if (responseData && typeof responseData === "object" && "password" in responseData) {
          delete responseData.password;
        }

        // Send a successful response
        return res.status(status).send(responseData);
      } catch (error) {
        // Pass any errors to the error handler middleware
        next(error);
      }
    };
    return descriptor;
  };
}

