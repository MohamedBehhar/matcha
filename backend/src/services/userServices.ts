import bcrypt from "bcryptjs";
import orm from "../lib/orm";
import { ConflictError, UnauthorizedError, ForbiddenError } from "../lib/customError";
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
    if (token == "null" || token == "undefined") {
      throw new ForbiddenError("Forbidden");
    }
    const email = await authServices.verifyToken(
      token as string,
      env.JWT_SECRET as string,
      "access"
    );
    // check signature
    if (!email) {
      throw new UnauthorizedError("Unauthorized");
    }
    this.socket?.emit("me", email);
    const user = await orm.findOne("users", { where: { email } });
    return user;
  }

  public async create(data: SignUpInput) {
    const body = signUpType.validate(data);
    const isAlreadyUsed = await orm.findOne("users", {
      where: { email: body.email },
    });
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
    return await orm.create("images", {
      user_id: userId,
      url: file.path,
      is_profile: true,
    });
  }

  public async addUserInterests(userId: string, interestsIds: string[]) {
    const user = await orm.findOne("users", { where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    const userInterests = await orm.querySql(
      `
      SELECT * FROM user_interests WHERE user_id = $1
    `,
      [userId]
    );
    if (userInterests.length) {
      await orm.querySql(
        `
        DELETE FROM user_interests WHERE user_id = $1
      `,
        [userId]
      );
    }
    for (const interestId of interestsIds) {
      await orm.create("user_interests", {
        user_id: userId,
        interest_id: interestId,
      });
    }

    return [];
  }

  public async getUsersById(id: string) {
    const interests = await orm.querySql(
      `
    SELECT interests.*
    FROM interests
    JOIN user_interests ON interests.id = user_interests.interest_id
    WHERE user_interests.user_id = $1
  `,
      [id]
    );
    const user = await orm.findOne("users", { where: { id } });
    return { ...user, interests };
  }

  public async delete(id: string) {
    return await orm.delete("users", id);
  }

  public async updateUserLocation(id: string, data: any) {
    return await orm.querySql(
      `UPDATE users SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326), longitude = $1, latitude = $2 WHERE id = $3 RETURNING *`,
      [data.longitude, data.latitude, data.userId]
    );
  }

  public async changeUserDataCompleteStatus(id: string) {
    const user = await orm.findOne("users", { where: { id } });
    const userInterests = await orm.querySql(
      `
      SELECT * FROM user_interests WHERE user_id = $1
    `,
      [id]
    );
    if (!user) {
      throw new Error("User not found");
    }
    if (
      user.bio == null ||
      user.profile_picture == null ||
      user.date_of_birth == null ||
      user.gender == null ||
      user.sexual_preference == null ||
      userInterests.length <= 2
    ) {
      await orm.update("users", id, { is_required_data_filled: false });
    } else {
      await orm.update("users", id, { is_required_data_filled: true });
      // apdate user age in users table
      await orm.querySql(
        `UPDATE users SET age = EXTRACT(YEAR FROM AGE(date_of_birth)) WHERE id = $1`,
        [id]
      );
    }
  }
}

export default new UserService();
