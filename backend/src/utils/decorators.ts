import { Request, Response, NextFunction } from "express";

type HandlerFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export function handleResponse() {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                const result = await original.call(this, req, res, next);
                if (result.status >= 400)
                    return res.status(result.status).send(result.message);
                else if ((result.status == 200 || result.status == 201) && result.data)
                    return res.status(result.status).send(result.data);
                else
                    return res.status(500).send("Internal server error")

                // res.status(200).send(result);
            } catch (error) {
                next(error);
            }
        };
        return descriptor;
    };
}
