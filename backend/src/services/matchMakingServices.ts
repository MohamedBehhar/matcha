import orm from "../lib/orm";
import { Server } from "socket.io";
import pool from "../db/db";

class MatchMakingServices {
  private socket: Server | undefined;
  private userMap: Map<string, string> = new Map();

  constructor() {
    this.likeAUser = this.likeAUser.bind(this);
    this.unlikeAUser = this.unlikeAUser.bind(this);
  }

  public initSocket(io: Server, userMap: Map<string, string>) {
    this.socket = io;
    this.userMap = userMap;
  }

  public async likeAUser(body: any) {
    const { user_id, liked_id } = body;

    await orm.create("user_interactions", {
      user_id,
      target_user_id: liked_id,
      interaction_type: "like",
    });

    const user = await orm.findOne("users", { where: { id: user_id } });
    const liked = await orm.findOne("users", { where: { id: liked_id } });

    await orm.create("notifications", {
      user_id: liked_id,
      content: `${user?.first_name} ${user?.last_name} liked you!`,
      sender_id: user_id,
    });

    const mutualLike = await orm.findOne("user_interactions", {
      where: {
        user_id: liked_id,
        target_user_id: user_id,
        interaction_type: "like",
      },
    });

    const receiver_id = this.userMap.get(liked_id + "");
    if (receiver_id) {
      this.socket?.to(receiver_id).emit("like", user_id);
      this.socket?.to(receiver_id).emit("notification");
    }

    if (mutualLike) {
      // Create a friendship
      const friendship = await orm.create("friendships", {
        user_id,
        friend_id: liked_id,
      });
      this.socket?.to(user_id).emit("match", liked);
      this.socket?.to(liked_id).emit("match", user);

      return { message: "It's a match!", friendship };
    }

    return { message: "Like added" };
  }

  public async unlikeAUser(body: any) {
    const { user_id, disliked_id } = body;

    // Insert the "dislike" interaction
    await orm.create("user_interactions", {
      user_id,
      target_user_id: disliked_id,
      interaction_type: "dislike",
    });

    return { message: "Dislike added" };
  }

  public async getMatches(
    latitude: number,
    longitude: number,
    distance: number,
    user_id: string,
    min_age?: number,
    max_age?: number,
    interests?: string[] | null
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
  u.age,
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
  AND u.age >= $5
  AND u.age <= $6
  AND ($7::integer[] IS NULL OR EXISTS (
    SELECT 1
    FROM user_interests ui2
    WHERE ui2.user_id = u.id
    AND ui2.interest_id = ANY($7::integer[])
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
    try {
      const { rows } = await pool.query(query, [
        latitude,
        longitude,
        distance,
        user_id,
        min_age,
        max_age,
        interests,
      ]);
      return rows;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Database query failed");
    }
  }
}

export default new MatchMakingServices();


