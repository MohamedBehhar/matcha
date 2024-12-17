import { User } from "../types/authTypes";
import pool from "../db/db";


class geolocationServices {
  
constructor () {
  this.getUsersUnderRadius = this.getUsersUnderRadius.bind(this);
}


public async getUsersUnderRadius  (
  latitude: number,
  longitude: number,
  radius: number,
  user_id: string
) {
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
  u.sexual_preference,
  CEIL(
    ST_Distance(
      ST_GeogFromText('SRID=4326;POINT(' || $2 || ' ' || $1 || ')'),
      u.location
    ) / 1000
  ) AS distance
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
    FROM user_interactions ui
    WHERE ui.user_id = $4
    AND ui.target_user_id = u.id
    AND ui.interaction_type IN ('like', 'dislike')
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

}


export default new geolocationServices();
