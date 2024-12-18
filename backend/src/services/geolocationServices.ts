import { User } from "../types/authTypes";
import pool from "../db/db";

class geolocationServices {
  constructor() {
    this.getUsersUnderRadius = this.getUsersUnderRadius.bind(this);
  }

  public async getUsersUnderRadius(
    latitude: number,
    longitude: number,
    distance: number,
    user_id: string,
    min_age?: number,
    max_age?: number,
    interests?: string[]
  ) {
    console.log(
      "-- - -  - - - - - ",
     typeof min_age,
    );

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
LEFT JOIN user_interests ui ON ui.user_id = u.id
WHERE 
  ST_DWithin(
    ST_GeogFromText('SRID=4326;POINT(' || $2 || ' ' || $1 || ')'),
    u.location,
    $3
  )
  AND u.id != $4
  AND ($5::INTEGER IS NULL OR u.age >= $5::INTEGER) -- Min age filter
  AND ($6::INTEGER  IS NULL OR u.age <= $6::INTEGER) -- Max age filter
  AND ($7::INTEGER[] IS NULL OR EXISTS (
    SELECT 1
    FROM user_interests ui2
    WHERE ui2.user_id = u.id
    AND ui2.interest_id = ANY($7::INTEGER[])
  ))
  AND NOT EXISTS (
    SELECT 1
    FROM user_interactions interactions
    WHERE interactions.user_id = $4
    AND interactions.target_user_id = u.id
    AND interactions.interaction_type IN ('like', 'dislike')
  )
GROUP BY u.id
ORDER BY distance ASC;
  `;

    // console.log('query',query);

    try {
      const { rows } = await pool.query(query, [
        latitude,
        longitude,
        distance,
        user_id,
        min_age || null,
        max_age || null,
        interests || null,
      ]);
      console.log("rows", rows);
      return rows;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Database query failed");
    }
  }
}

export default new geolocationServices();
