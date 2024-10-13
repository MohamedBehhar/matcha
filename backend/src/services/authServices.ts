import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import { Request, Response } from "express";
import { SignUpInput, User, tokens } from "../types/authTypes";

const db: Pool = require("../db/db");
// Token expiration times
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

    const newUser = await db
      .query(
        "INSERT INTO users (username, password, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [username, hashedPassword, email, first_name, last_name]
      )
      .then((result: any) => {
        const user = result.rows[0];

        console.log(process.env.JWT_SECRET);
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
          bcrypt.hash(refresh_token, salt).then((hashedRefreshToken: any) => {
            db.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
              hashedRefreshToken,
              user.id,
            ]);
          });
        }
        delete user.password;
        return { ...user, access_token, refresh_token };
      });

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
  console.log('------ ',refresh_token);
  try {
    const user = await db
      .query("SELECT * FROM users WHERE refresh_token = $1", [refresh_token])
      .then((result: any) => {
        console.log("hhhh", result)
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

const authServices = {
  signUp,
  singIn,
  refresh,
};

export default authServices;
