import pool from "../db/db";

const returnTags = async () => {
	  try {
	const tags = await pool.query("SELECT * FROM tags");
	return tags.rows;
  } catch (err) {
	console.log("Error: ", err);
	throw err;
  }
};

const tagsServices = {
	  returnTags,
};

export default tagsServices;