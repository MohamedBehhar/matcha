
import pool from "./db";


/// use init.sql to create the table

export const seed = async () => {
  try {
    await pool.query(
      `INSERT INTO users (username, email, password, first_name, last_name, is_verified) VALUES ('admin', 'admin@admin.comn', 'test', 'admin', 'admin', true)`
    );
    } catch (err) {
    console.error(err);
    }
}


seed().then(() => {
    console.log("Database seeded");
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
