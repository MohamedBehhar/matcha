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
    age_gap: number,
    interests?: string[] | null
  ) {
    const user = await orm.findOne("users", {
      where: { id: user_id },
    });

    const query = `
    SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.age, 
        u.bio, 
        u.first_name, 
        u.last_name, 
        u.rating, 
        u.gender, 
        u.sexual_preference, 
        u.latitude, 
        u.longitude,
        CEIL(
            ST_Distance(
                ST_GeogFromText('SRID=4326;POINT(' || $2 || ' ' || $1 || ')'),
                u.location
            ) / 1000
        ) AS distance
    FROM 
        users u
    WHERE 
        ST_DWithin(
            ST_GeogFromText('SRID=4326;POINT(' || $2 || ' ' || $1 || ')'),
            u.location,
            $3
        )
        AND NOT EXISTS (
          SELECT 1
          FROM user_interactions interactions
          WHERE interactions.user_id = $4
          AND interactions.target_user_id = u.id
          AND interactions.interaction_type IN ('like', 'dislike')
        )
        AND u.id != $4 -- Exclude the current user
        AND u.age >= $5 -- Minimum age filter
        AND u.age <= $6 -- Maximum age filter
        AND (
            -- Match based on sexual preference logic
            CASE 
                WHEN $7 = 'bisexual' THEN TRUE -- Bisexual sees everyone
                WHEN $7 = 'heterosexual' AND $8 = 'male' THEN (u.gender = 'female' AND u.sexual_preference IN ('heterosexual', 'bisexual'))
                 WHEN $7 = 'heterosexual' AND $8 = 'female' THEN (u.gender = 'male' AND u.sexual_preference IN ('heterosexual', 'bisexual'))
                 WHEN $7 = 'homosexual' AND $8 = 'male' THEN (u.gender = 'male' AND u.sexual_preference IN ('homosexual', 'bisexual'))
                 WHEN $7 = 'homosexual' AND $8 = 'female' THEN (u.gender = 'female' AND u.sexual_preference IN ('homosexual', 'bisexual'))
                ELSE FALSE -- Default to no match
            END
        )
        AND (
            -- Match based on shared interests
            $9::integer[] IS NULL OR EXISTS (
                SELECT 1
                FROM user_interests ui2
                WHERE ui2.user_id = u.id
                AND ui2.interest_id = ANY($9::integer[])
            )
        )
    ORDER BY 
        distance ASC;
  `;

    const min_age = user?.age - age_gap;
    const max_age = user?.age + age_gap;

    console.log("User's sexual preference:", user?.sexual_preference);
    console.log("User's gender:", user?.gender);

    try {
      const { rows } = await pool.query(query, [
        latitude,
        longitude,
        distance,
        user_id,
        min_age,
        max_age,
        user?.sexual_preference,
        user?.gender,
        interests,
      ]);
      return rows;
    } catch (error) {
      console.error("Error executing query:", error);
    }
  }
}

export default new MatchMakingServices();
