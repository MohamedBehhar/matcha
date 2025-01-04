import orm from "../lib/orm";
import { Server } from "socket.io";
import pool from "../db/db";
import notificationsServices from "./notificationsServices";
import userServices from "./userServices";

class UsersInteractionsServices {
  private socket: Server | undefined;
  private userMap: Map<string, string> = new Map();

  constructor() {
    this.likeAUser = this.likeAUser.bind(this);
    this.unlikeAUser = this.unlikeAUser.bind(this);
    this.getMatches = this.getMatches.bind(this);
  }

  public initSocket(io: Server, userMap: Map<string, string>) {
    this.socket = io;
    this.userMap = userMap;

    this.socket.on("newVisit", async (data: any) => {
      console.log("newVisit", data);
      await this.newVisit(data.user_id, data.visited_id);
    });
  }

  public async likeAUser(body: any) {
    const { user_id, liked_id } = body;
    const alreadyDisliked = await orm.findOne("user_interactions", {
      where: {
        user_id,
        target_user_id: liked_id,
        interaction_type: "dislike",
      },
    });
    const user = await orm.findOne("users", { where: { id: user_id } });
    const liked = await orm.findOne("users", { where: { id: liked_id } });

    if (alreadyDisliked) {
      await orm.querySql(
        "UPDATE user_interactions SET interaction_type = 'like' WHERE user_id = $1 AND target_user_id = $2",
        [user_id, liked_id]
      );
    } else {
      await orm.create("user_interactions", {
        user_id,
        target_user_id: liked_id,
        interaction_type: "like",
      });
    }
    const mutualLike = await orm.findOne("user_interactions", {
      where: {
        user_id: liked_id,
        target_user_id: user_id,
        interaction_type: "like",
      },
    });

    const receiver_id = this.userMap.get(liked_id + "");
    if (receiver_id) {
      const sender = await userServices.getUsersById(user_id);
      notificationsServices.createNotification(
        liked_id,
        `${sender.username} liked your profile`,
        user_id
      );
    }

    if (mutualLike) {
      // Create a friendship
      const friendship = await orm.create("friendships", {
        user_id,
        friend_id: liked_id,
      });
      const sender = await userServices.getUsersById(user_id);
      const receiver = await userServices.getUsersById(liked_id);
      notificationsServices.createNotification(
        liked_id,
        `${sender.username} and you are now friends`,
        user_id
      );
      notificationsServices.createNotification(
        user_id,
        `${receiver.username} and you are now friends`,
        liked_id
      );

      return { message: "It's a match!", friendship };
    }

    return { message: "Like added" };
  }

  public async unlikeAUser(body: any) {
    const { user_id, disliked_id } = body;
    const like = await orm.findOne("user_interactions", {
      where: {
        user_id,
        target_user_id: disliked_id,
        interaction_type: "like",
      },
    });

    if (like) {
      await orm.querySql(
        "UPDATE user_interactions SET interaction_type = 'dislike' WHERE user_id = $1 AND target_user_id = $2",
        [user_id, disliked_id]
      );
    } else {
      await orm.create("user_interactions", {
        user_id,
        target_user_id: disliked_id,
        interaction_type: "dislike",
      });
      const sender = await userServices.getUsersById(user_id);
      notificationsServices.createNotification(
        disliked_id,
        `${sender.username} disliked your profile`,
        user_id
      );

    }

    return { message: "Dislike added" };
  }

  public async blockAUser(body: any) {
    const { user_id, blocked_id } = body;

    // Insert the "block" interaction
    await orm.create("user_interactions", {
      user_id,
      target_user_id: blocked_id,
      interaction_type: "block",
    });

    return { message: "Blocked user" };
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
        u.profile_picture,
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

  public async checkLike(user_id: string, target_id: string) {
    const like = await orm.querySql(
      "SELECT * FROM user_interactions WHERE user_id = $1 AND target_user_id = $2 AND interaction_type = 'like'",
      [user_id, target_id]
    );

    console.log("Like8:", like);

    return { liked: like.length > 0 ? true : false };
  }

  public async newVisit(user_id: string, visited_id: string) {
    await orm.create("visits", { user_id, visited_id });
    await notificationsServices.createNotification(
      visited_id,
      `User ${user_id} visited your profile`,
      user_id
    );

    return;
  }
}

export default new UsersInteractionsServices();
