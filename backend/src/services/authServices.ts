import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { SignUpInput, signUpType, Tokens, User, verifyEmailReturn } from "../types/authTypes";
import { deleteKey, getKey, setKey } from "../utils/redis";
import pool from "../db/db";
import orm from "../lib/orm";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../lib/customError";
class AuthServices {
  constructor() {
    this.signUp = this.signUp.bind(this);
    this.singIn = this.singIn.bind(this);
    this.logout = this.logout.bind(this);
    this.refresh = this.refresh.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
  }
  private accessTokenMaxAge = 60 * 30;
  private refreshTokenMaxAge = 60 * 60 ;

  public async createTokens(user: User): Promise<Tokens> {
    const access_token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: this.accessTokenMaxAge,
      }
    );
    const refresh_token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.REFRESH_SECRET as string,
      {
        expiresIn: this.refreshTokenMaxAge,
      }
    );

    await this.setTokensInRedis({ access_token, refresh_token }, user.email);  

    return { access_token, refresh_token };
  }

  public async verifyToken(
    token: string,
    secret: string,
    type: string
  ): Promise<string | null> {
    try {
      jwt.verify(token, secret);
      const decoded = jwt.verify(token, secret) as {
        email: string;
      };
      if (!decoded.email) {
        return null;
      }
      let checkRedis = null;
      if (type === "access") {
         checkRedis = await getKey(`access_token_${decoded.email}`);
      }
      if (type === "refresh") {
         checkRedis = await getKey(`refresh_token_${decoded.email}`);
      }
      if (!checkRedis) {
        return null;
      }
      return decoded.email;
    } catch (error) {
      return null;
    }
  }

  public async signUp(data: SignUpInput): Promise<Record<string, unknown>> {
    try {
      const body = signUpType.validate(data);
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const newUser = await orm.create("users", {
        ...body,
        password: hashedPassword,
        is_verified: false,
      });
      const verifyToken = jwt.sign(
        { email: newUser.email },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );
      if (newUser) {
        const transporter = nodemailer.createTransport({
          service: "Gmail", // or another email service
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: newUser.email,
          subject: "Verify your account",
          html: `<p>Click <a href="http://localhost:5173/verify/${verifyToken}">here</a> to verify your account.</p>`,
        };

        await transporter.sendMail(mailOptions);
      }

      return newUser;
    } catch (err) {
      throw err;
    }
  }

  public async singIn(data: {
    email: string;
    password: string;
  }): Promise<User | undefined> {
    const user = await orm.findOne("users", { where: { email: data.email } });
    if (!user) {
      throw new ForbiddenError("User not found");
    }

    if (false == user.is_verified) {
      throw new ForbiddenError("Account not verified");
    }
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid password");
    }
    await orm.update("users", user.id, { is_authenticated: true });

    const tokens = await this.createTokens(user);

    if (true == user.is_verified) {
      delete (user as { password?: string }).password;
      return {
        ...user,
          ...tokens,
      };
    } else throw new ForbiddenError("Account not verified");
  }

  public async logout(access_token: string): Promise<void> {
    try {
      const email = await this.verifyToken(
        access_token,
        process.env.JWT_SECRET as string,
        "access"
      );
      if (!email) {
        throw new UnauthorizedError("Invalid token");
      }
      await deleteKey(`access_token_${email}`);
      await deleteKey(`refresh_token_${email}`);
    } catch (err) {
      throw err;
    }
  }


  public async setTokensInRedis(tokens: Tokens, email: string): Promise<void> {
    try {
      await setKey(
        `access_token_${email}`,
        tokens.access_token,
        this.accessTokenMaxAge
      );
      await setKey(
        `refresh_token_${email}`,
        tokens.refresh_token,
        this.refreshTokenMaxAge
      );
    } catch (err) {
      throw err;
    }

  }

  public async refresh(refresh_token: string): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    try {
      const email = await this.verifyToken(
        refresh_token,
        process.env.REFRESH_SECRET as string,
        "refresh"
      );
      if (!email) {
        throw new ForbiddenError("Invalid token");
      }
      if (!email) {
        throw new UnauthorizedError("Invalid token");
      }
      const user = await pool
        .query("SELECT * FROM users WHERE email = $1", [email])
        .then((result: any) => {
          return result.rows[0];
        });
      if (!user) {
        throw new NotFoundError("User not found");
      }
      const tokens = await this.createTokens(user);
      await this.setTokensInRedis(tokens, email );
      return tokens;
    } catch (err) {
      throw err;
    }
  }

  public async verifyEmail(token: string): Promise<verifyEmailReturn | null> {
    try {
      const { email } = jwt.verify(token, process.env.JWT_SECRET as string) as {
        email: string;
      };
      if (!email) {
        throw new UnauthorizedError("Invalid token");
      }
      const user: User | null = await pool
      .query(
        "UPDATE users SET is_verified = $1, is_authenticated = $2 WHERE email = $3 RETURNING *",
        [true, true, email]
      )      
        .then((result: { rows: User[] }) => result.rows[0]);

      if (!user) {
        throw new NotFoundError("User not found");
      }
      delete (user as { password?: string }).password;
      const tokens = await this.createTokens(user);
      await this.setTokensInRedis(tokens, email);

      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        is_verified: user.is_verified,
        is_authenticated: user.is_authenticated,
        ...tokens,
      };
    } catch (err) {
      throw err;
    }
  }
}

export default new AuthServices();
