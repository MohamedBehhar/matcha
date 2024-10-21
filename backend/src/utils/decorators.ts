import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../lib/customError";

type HandlerFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export function handleResponse() {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                let status = null;
                if (req.method == "POST" || req.method == "PATCH"){
                    if (Object.keys(req.body).length == 0){
                        throw new ValidationError("Request body cannot be empty");
                    }
                }
                const result = await original.call(this, req, res, next);
                if (result instanceof Error)
                {
                    return next(result);
                }
                else
                {
                    if (!result.status && result.status !== 0){
                         status =  req.method == "POST" ? 201 : 200;
                    }
                    if (!result.data && result){
                        result.data= {
                            ...result
                        }
                    }
                    else if (!result.data && !result){
                        result.data = "";
                    }
                }
                status = status || result.status;
              
                if ((status == 200 || status == 201) && result.data)
                    return res.status(status).send(result.data);
                else
                    return res.status(500).send("Internal server error")

            } catch (error) {
                next(error);
            }
        };
        return descriptor;
    };
}
