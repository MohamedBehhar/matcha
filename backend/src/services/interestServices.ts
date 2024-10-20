import pool from "../db/db";

// Service function to return interests
const returnIntersts = async () => {
  try {
    const tags = await pool.query("SELECT * FROM interests");
    return tags.rows;
  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
};

const interestServices = {
  returnIntersts,
};

export default interestServices;
