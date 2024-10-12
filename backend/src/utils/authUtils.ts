import { Pool } from "pg";
const db: Pool = require("../db/db");

export const checkUserNameAndEmail = async (
  username: string,
  email: string
) => {
  const user = await db
    .query("SELECT * FROM users WHERE username = $1 OR email = $2", [
      username,
      email,
    ])
    .then((result: any) => {
      return result.rows[0];
    });
  if (user) {
    return true;
  }
  return false;
};
