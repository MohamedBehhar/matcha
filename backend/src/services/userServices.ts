import bcrypt from "bcryptjs";
import orm from "../lib/orm";
import { ConflictError, UnauthorizedError } from "../lib/customError";
import authServices from "./authServices";
import env from "../utils/env";
import { Server } from "socket.io";
import { SignUpInput, signUpType, User } from "../types/authTypes";
import { updateUserDto } from "../types/userTypes";

class UserService {
  private socket: Server | undefined;

  constructor() {
    this.me = this.me.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public initSocket(io: Server) {
    this.socket = io;
  }

  public async me(token: string | undefined) {
    const email = await authServices.verifyToken(token as string, env.JWT_SECRET as string);
    if (!email) {
      throw new UnauthorizedError("Unauthorized");
    }
    this.socket?.emit("me", email);
    const user = await orm.findOne("users", { where: { email } });
    return user;
  }

  public async create(data: SignUpInput) {
    const body = signUpType.validate(data);
    const isAlreadyUsed = await orm.findOne("users", { where: { email: body.email } });
    if (isAlreadyUsed) {
      throw new ConflictError("Email already used");
    }
    const password = await bcrypt.hash(body.password, 10);
    const user = await orm.create("users", { ...body, password });
    const tokens = await authServices.createTokens(user);
    return { ...user, tokens };
  }

  public async update(data: any, id: string) {
    const body = updateUserDto.validate(data);
    return await orm.update("users", id, body);
  }

  public async addUserImage(userId: string, file: any) {
    // Save the image URL and set it as the profile picture if necessary
    console.log("file", file);
    return await orm.create("images", {
      user_id: userId,
      url: file.path,
      is_profile: true, // or manage the logic to set `is_profile` accordingly
    });
  }

  public async delete(id: string) {
    return await orm.delete("users", id);
  }
}

export default new UserService();
