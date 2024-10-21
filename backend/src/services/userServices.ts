import bcrypt from "bcryptjs";
import {  SignUpInput, signUpType, User } from "../types/authTypes";
import orm from "../lib/orm";
import { ConflictError, UnauthorizedError } from "../lib/customError";
import authServices from "./authServices";
import env from "../utils/env";

class UserService {

    constructor() {
        this.me = this.me.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    public async me( token: string | undefined) {
        const email = await authServices.verifyToken(token as string, env.JWT_SECRET as string);
        if (!email) {
            throw new UnauthorizedError("Unauthorized");
        }
        const user = await orm.findOne("users", { where: { email } });
        return user;
    }

    public async create(data:SignUpInput) {
        const body = signUpType.validate(data);
        const isAlreadyUsed = await orm.findOne("users", { where: { email: body.email} });
        if (isAlreadyUsed) {
            throw new ConflictError("Email already used");
        }
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const user = await orm.create("users", { ...body, password: hashedPassword });
        const tokens = await authServices.createTokens(user);
        return {
            ...user,
            tokens,
        }
    }

    public async update(data:any, id:string) {
        const body = signUpType.validate(data);
        const user = await orm.update("users", id, body);
        return user;
    }

    public async delete(id:string) {
        return await orm.delete("users", id);
    }

}


export default new UserService;