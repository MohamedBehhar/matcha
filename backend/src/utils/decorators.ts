import { NextFunction, Request, Response } from "express";

type HandlerFunction = (req: Request, res: Response, next: NextFunction) => any;

export function handleResponse() {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<HandlerFunction>
    ) {
        const originalMethod = descriptor.value!;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                const result = await originalMethod.call(this, req, res, next);
                if (result && result.status) {
                    if (result.status >= 400) {
                        res.status(result.status).send(result.message);
                    } else if (result.status == 201 || result.status == 200 || !result.status
                    ) {
                        result.status = result.status || 200;
                        res.status(result.status).send(result);
                    }
                }
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal server error");
            }
        };
    };
}