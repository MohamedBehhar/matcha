import { User } from "../types/authTypes";
import pool from "../db/db";

const getUsersUnderRadius = async (
  latitude: number,
  longitude: number,
  radius: number,
  user_id: string
): Promise<User[]> => {
  const query = `
	  SELECT id, username, email, location, bio, first_name, last_name, rating, gender, sexual_preference
	   FROM users
	   WHERE ST_DWithin(
		ST_GeogFromText('SRID=4326;POINT(' || $2 || ' ' || $1 || ')'),
		location,
		$3
	  ) AND id != $4
	`;

  try {
    const { rows } = await pool.query(query, [
      latitude,
      longitude,
      radius,
      user_id,
    ]);
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
