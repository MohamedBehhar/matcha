import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import { SignUpInput, User, tokens } from "../types/authTypes";

const db: Pool = require("../db/db");

const accessTokenMaxAge = 1 * 30; // 1 minute
const refreshTokenMaxAge = 2 * 24 * 60 * 60; // 2 days

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
        "INSERT INTO users (username, password, email, first_name, last_name, isVerified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [username, hashedPassword, email, first_name, last_name, false]
      )
      .then((result: any) => {
        return result.rows[0];
      });

    if (newUser) {
      console.log("Verification token: ", process.env.EMAIL_USER);
      console.log("Verification token: ", process.env.EMAIL_PASS);
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
        html: `<p>Click <a href="http://localhost:3000/api/auth/verify?token=${verificationToken}">here</a> to verify your account.</p>`,
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
  username: string,
  password: string
): Promise<tokens | undefined> => {
  try {
    const user = await db
      .query("SELECT * FROM users WHERE username = $1", [username])
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

    const access_token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: accessTokenMaxAge,
      }
    );

    const refresh_token = jwt.sign(
      { id: user.id },
      process.env.REFRESH_SECRET as string,
      {
        expiresIn: refreshTokenMaxAge,
      }
    );

    // Add refresh token to the database if it doesn't exist
    if (!user.refresh_token) {
      const salt = await bcrypt.genSalt(10);
      bcrypt.hash(refresh_token, salt).then((hashedRefreshToken: any) => {
        db.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
          hashedRefreshToken,
          user.id,
        ]);
      });
    }

    return { access_token, refresh_token };
  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
};

const refresh = async (refresh_token: string): Promise<User | undefined> => {
  console.log("------ ", refresh_token);
  try {
    const user = await db
      .query("SELECT * FROM users WHERE refresh_token = $1", [refresh_token])
      .then((result: any) => {
        console.log("hhhh", result);
        return result.rows[0];
      });

    if (!user) {
      return undefined;
    }

    const isMatch = await bcrypt.compare(refresh_token, user.refresh_token);

    if (!isMatch) {
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
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      email: string;
    };

    // Find the user by email and update their isVerified field
    const user: User | null = await db
      .query("UPDATE users SET isVerified = $1 WHERE email = $2 RETURNING *", [
        true,
        decoded.email,
      ])
      .then((result: { rows: User[] }) => result.rows[0]);

    if (!user) {
      return null;
    }

    return user;
  } catch (err) {
    console.error('Error verifying email:', err);
    return null; // Handle error gracefully
  }
};


const authServices = {
  signUp,
  singIn,
  refresh,
  verifyEmail,
};

export default authServices;
