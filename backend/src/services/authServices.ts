import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {
  SignUpInput,
  signUpType,
  Tokens,
  User,
  verifyEmailReturn,
} from "../types/authTypes";
import { deleteKey, getKey, setKey } from "../utils/redis";
import pool from "../db/db";
import orm from "../lib/orm";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../lib/customError";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Response, NextFunction, Request } from "express";

class AuthServices {
  constructor() {
    this.signUp = this.signUp.bind(this);
    this.singIn = this.singIn.bind(this);
    this.logout = this.logout.bind(this);
    this.refresh = this.refresh.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.configureGoogleStrategy();
  }
  private accessTokenMaxAge = 1000 * 60 * 30;
  private refreshTokenMaxAge = 1000 * 60 * 120;

  private configureGoogleStrategy() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          callbackURL: "http://localhost:3000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, cb) => {
          try {
            const user = await this.findOrCreateUser(profile);
            cb(null, user);
          } catch (err) {
            cb(err);
          }
        }
      )
    );

    passport.serializeUser((user: any, cb) => {
      cb(null, user.google_id);
    });

    passport.deserializeUser(async (google_id: string, cb) => {
      try {
        const user = await this.findUserByGoogleId(google_id);
        cb(null, user);
      } catch (err) {
        console.log(err);
        cb(err);
      }
    });
  }

  // Find or create a user using Google profile
  public async findOrCreateUser(profile: any): Promise<User> {
    const user = await orm.findOne("users", {
      where: { google_id: profile.id },
    });
    if (user) {
      return user;
    } else {
      const emailExists = await orm.findOne("users", {
        where: { email: profile.emails?.[0].value },
      });
      if (emailExists) {
        throw new ConflictError("Email already exists");
      }
      const newUser = await orm.create("users", {
        google_id: profile.id,
        email: profile.emails?.[0].value,
        username: profile.displayName,
        first_name: profile.name?.givenName,
        last_name: profile.name?.familyName,
        is_verified: true,
        is_authenticated: true,
        auth_provider: "google",
        password: null,
      });
      const tokens = await this.createTokens(newUser.email as string);
      return {
        ...newUser,
        ...tokens,
      };
    }
  }

  // Find a user by Google ID
  public async findUserByGoogleId(google_id: string): Promise<User | null> {
    return await orm.findOne("users", { where: { google_id } });
  }

  // Google OAuth Login
  public googleLogin() {
    return passport.authenticate("google", { scope: ["profile", "email"] });
  }

  // Google OAuth Callback
  public googleCallback(req: Request, res: Response, next: NextFunction) {
    return passport.authenticate("google", async (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(
          "http://localhost:5173/google-auth-failed"
        );
      }

      try {
        const tokens = await this.createTokens(user.email as string);

        res.cookie("access_token", tokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: this.accessTokenMaxAge,
        });



        res.redirect("http://localhost:5173");
      } catch (error) {
        res.redirect(
          "http://localhost:5173/login?error=Token generation failed"
        );
      }
    })(req, res, next);
  }

  public async createTokens(email: string): Promise<Tokens> {
    const access_token = jwt.sign(
      { email: email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: this.accessTokenMaxAge,
      }
    );
    const refresh_token = jwt.sign(
      { email: email },
      process.env.REFRESH_SECRET as string,
      {
        expiresIn: this.refreshTokenMaxAge,
      }
    );

    await this.setTokensInRedis({ access_token, refresh_token }, email);

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

  public async singIn(
    data: {
      email: string;
      password: string;
    },
    res: Response
  ): Promise<User | undefined> {
    console.log(data);
    const user = await orm.findOne("users", { where: { email: data.email } });
    if (!user) {
      throw new ForbiddenError("User not found");
    }

    if (false == user.is_verified) {
      throw new ForbiddenError("Account not verified");
    }
    const isMatch = await bcrypt.compare(data.password, user.password);
    // const isMatch = data.password === user.password;
    if (!isMatch) {
      throw new UnauthorizedError("Invalid password");
    }
    await orm.update("users", user.id, { is_authenticated: true });

    const tokens = await this.createTokens(user.email as string);
    res.cookie("access_token", tokens.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: this.accessTokenMaxAge,
    });
    res.cookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: this.refreshTokenMaxAge,
    });

    if (true == user.is_verified) {
      delete (user as { password?: string }).password;
      return {
        ...user,
        ...tokens,
      };
    } else throw new ForbiddenError("Account not verified");
  }

  public async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.cookie("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0, // ✅ Immediately expires the cookie
      });

      res.cookie("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0, // ✅ Immediately expires the cookie
      });

      res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      next(err);
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

  public async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refresh_token = req.cookies?.refresh_token;
      if (!refresh_token) {
        throw new ForbiddenError("No refresh token provided");
      }

      const email = await this.verifyToken(
        refresh_token,
        process.env.REFRESH_SECRET as string,
        "refresh"
      );

      if (!email) {
        throw new ForbiddenError("Invalid token");
      }

      const user = await pool
        .query("SELECT * FROM users WHERE email = $1", [email])
        .then((result: any) => result.rows[0]);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      const tokens = await this.createTokens(email);

      // ✅ Set new cookies
      res.cookie("access_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: this.accessTokenMaxAge,
      });

      res.json({ success: true });
    } catch (err) {
      next(err); // ✅ Pass error to global error handler
    }
  }

  public async verifyEmail(
    token: string,
    res: Response
  ): Promise<verifyEmailReturn | null> {
    try {
      console.log("- - - - - - - - - - -> ", token);
      const { email } = jwt.verify(token, process.env.JWT_SECRET as string) as {
        email: string;
      };
      console.log("- - - - - - - - - - -> ", email);
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
      const tokens = await this.createTokens(email);
      res.cookie("access_token", tokens.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: this.accessTokenMaxAge,
      });

      res.cookie("refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: this.refreshTokenMaxAge,
      });

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

  public async forgotPassword(email: string): Promise<void> {
    try {
      const user = await orm.findOne("users", { where: { email } });
      if (!user) {
        throw new NotFoundError("User not found");
      }
      const resetToken = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Reset your password",
        html: `<p>Click <a href="http://localhost:5173/reset/${resetToken}">here</a> to reset your password.</p>`,
      };

      await transporter.sendMail(mailOptions);
      return user;
    } catch (err) {
      throw err;
    }
  }

  public async resetPassword(token: string, password: string): Promise<void> {
    try {
      const { email } = jwt.verify(token, process.env.JWT_SECRET as string) as {
        email: string;
      };
      if (!email) {
        throw new UnauthorizedError("Invalid token");
      }

      const user = await orm.findOne("users", { where: { email } });
      const hashedPassword = await bcrypt.hash(password, 10);
      await orm.update("users", user.id, { password: hashedPassword });
      return user;
    } catch (err) {
      throw err;
    }
  }
}

export default new AuthServices();
