import { User } from "../types/authTypes";
import { Pool } from "pg";
const db: Pool = require("../db/db");

const getUsersUnderRadius = async (
	latitude: number,
	longitude: number,
	radius: number
  ): Promise<User[]> => {
	const query = `
	  SELECT id, username, email, location FROM users
	  WHERE ST_DWithin(
		ST_GeogFromText('SRID=4326;POINT(' || $2 || ' ' || $1 || ')'),
		location,
		$3
	  );
	`;
  
	console.log("service", latitude, longitude, radius);
	try {
	  const { rows } = await db.query(query, [latitude, longitude, radius]);
	  return rows;
	} catch (error) {
	  console.error("Error fetching users:", error);
	  throw new Error("Database query failed");
	}
  };
  

const geolocationServices = {
  getUsersUnderRadius,
};

export default geolocationServices;
