import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg"; // Assuming you're using pg for the database
import { Request, Response } from "express"; // Use proper typing for Request and Response

// Define your database interface here
const db: Pool = require("../db/db");
// Token expiration times
const accessTokenMaxAge = 1 * 30; // 1 minute
const refreshTokenMaxAge = 2 * 24 * 60 * 60; // 2 days

// Define input types
interface SignUpInput {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Define the return type for your signUp function
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  token: string;
  refresh_token: string;
}

export const signUp = async (
  req: Request,
  res: Response
): Promise<User | undefined> => {


  const { username, email, password, first_name, last_name }: SignUpInput =
    req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const newUser = await db
      .query(
        "INSERT INTO users (username, password, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *",
		[username, hashedPassword, email, first_name, last_name]
      )
      .then((result) => {
        const user = result.rows[0];

        console.log(process.env.JWT_SECRET);
        const token = jwt.sign(
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

        return { ...user, token, refresh_token };
      });

    return newUser;
  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
};

const authServices = {
  signUp,
};

export default authServices;
