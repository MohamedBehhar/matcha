import pg from "pg";
import env from "../utils/env";
const { Pool } = pg;





const pool = new Pool({
  connectionString: env.POSTGRES_URL,
});





export default pool;