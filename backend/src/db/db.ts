import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined, // Convert DB_PORT to a number
});

if (!process.env.DB_PASSWORD) {
  console.error("DB_PASS environment variable is not defined.");
}

pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("Error connecting to the database pool:", err);
  } else {
    console.log("Connected to the database at:", result.rows[0].now);
  }
});

module.exports = {
  query: (text: any, params: any) => pool.query(text, params),
};
