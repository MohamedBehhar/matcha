import pool from "../db/db";


export const checkUserNameAndEmail = async (
  username: string,
  email: string
) => {
  const user = await pool
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
