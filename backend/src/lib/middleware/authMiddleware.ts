import { NextFunction,Request,Response } from "express";
import { UnauthorizedError } from "../customError";
import authServices from "../../services/authServices";
import env from "../../utils/env";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization as string;
       
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedError("Unauthorized");
        }
        const email = await authServices.verifyToken(token,env.JWT_SECRET as string);
        if (!email) {
            throw new UnauthorizedError("Unauthorized");
        }
        req.headers.email = email;
        next();
    } catch (err) {
        next(err);
    }
}

export default authMiddleware;
