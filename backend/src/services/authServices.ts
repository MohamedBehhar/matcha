import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import { SignUpInput, User, tokens } from "../types/authTypes";

const db: Pool = require("../db/db");

const accessTokenMaxAge = 1 * 30; // 1 minute
const refreshTokenMaxAge = 2 * 24 * 60 * 60; // 2 days

const hashString = async (string: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(string, salt);
}

const createRefreshToken = async (user: User): Promise<string> => {
  const refresh_token = jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET as string,
    {
      expiresIn: refreshTokenMaxAge,
    }
  );



  return refresh_token;
};

const createAccessToken = async (user: User): Promise<string> => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: accessTokenMaxAge,
  });
};

const verifyRefreshToken = async (refresh_token: string): Promise<boolean> => {
  try {
    jwt.verify(refresh_token, process.env.REFRESH_SECRET as string);
  } catch (error) {
    console.log("error", error);
    return false;
  }
  return true;
};

export const signUp = async ({
  username,
  email,
  password,
  first_name,
  last_name,
}: SignUpInput): Promise<User | undefined> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    const newUser = await db
      .query(
        "INSERT INTO users (username, password, email, first_name, last_name, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [username, hashedPassword, email, first_name, last_name, false]
      )
      .then((result: any) => {
        return result.rows[0];
      });

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
        to: email,
        subject: "Verify your account",
        html: `<p>Click <a href="http://localhost:5137/verify?token=${verificationToken}">here</a> to verify your account.</p>`,
      };

      await transporter.sendMail(mailOptions);
    }

    return newUser;
  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
};

const singIn = async (
  email: string,
  password: string
): Promise<User | undefined> => {
  try {
    const user = await db
      .query("SELECT * FROM users WHERE email = $1", [email])
      .then((result: any) => {
        return result.rows[0];
      });

    if (!user) {
      return undefined;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return undefined;
    }
    console.log("user", user.is_verified);

    if (false == user.is_verified) {
      return { ...user };
    }

    const access_token = await createAccessToken(user);

    const refresh_token = await createRefreshToken(user);
    const hashedRefreshToken = await hashString(refresh_token);

    if (!user.refresh_token) {
      await db.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
        hashedRefreshToken,
        user.id,
      ]);
    }
    delete user.password;
    return { ...user, access_token, refresh_token };
  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
};

const logout = async (user_id: number): Promise<void> => {
  try {
    await db.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [ "", user_id]);
  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
}

const refresh = async (refresh_token: string): Promise<User | undefined> => {
  const hashedRefreshToken = await hashString(refresh_token);
  console.log("refresh_token", refresh_token);
  console.log("hashedRefreshToken", hashedRefreshToken);
  try {
    const user = await db
      .query("SELECT * FROM users WHERE refresh_token = $1", [hashedRefreshToken])
      .then((result: any) => {
        return result.rows[0];
      });

    if (!user) {
      return undefined;
    }

    console.log("user.refresh_token", user.refresh_token);
    console.log("refresh_token", refresh_token);
    console.log("user0000000", user.refresh_token == refresh_token);

    if (false == await verifyRefreshToken(refresh_token)) {
      return undefined;
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: accessTokenMaxAge,
    });

    return { ...user, token };
  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
};

export const verifyEmail = async (token: string): Promise<User | null> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      email: string;
    };

    const user: User | null = await db
      .query("UPDATE users SET is_verified = $1 WHERE email = $2 RETURNING *", [
        true,
        decoded.email,
      ])
      .then((result: { rows: User[] }) => result.rows[0]);

    if (!user) {
      return null;
    }
    const refresh_token = await createRefreshToken(user as User);
    const access_token = await createAccessToken(user as User);
    delete user.password;
    return { ...user, access_token, refresh_token };
  } catch (err) {
    throw err;
  }
};

const authServices = {
  signUp,
  singIn,
  refresh,
  verifyEmail,
};

export default authServices;
