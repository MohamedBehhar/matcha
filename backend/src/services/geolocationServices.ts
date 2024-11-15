import { User } from "../types/authTypes";
import pool from "../db/db";

const getUsersUnderRadius = async (
  latitude: number,
  longitude: number,
  radius: number,
  user_id: string
): Promise<User[]> => {
  const query = `
  SELECT 
  u.id, 
  u.username, 
  u.email, 
  u.location, 
  u.bio, 
  u.first_name, 
  u.last_name, 
  u.rating, 
  u.gender, 
  u.sexual_preference
FROM users u
WHERE 
  ST_DWithin(
    ST_GeogFromText('SRID=4326;POINT(' || $2 || ' ' || $1 || ')'),
    u.location,
    $3
  )
  AND u.id != $4
  AND NOT EXISTS (
    SELECT 1
    FROM likes l
    WHERE l.user_id = $4 AND l.liked_id = u.id
  )
  AND NOT EXISTS (
    SELECT 1
    FROM dislikes d
    WHERE d.user_id = $4 AND d.disliked_id = u.id
  )
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
