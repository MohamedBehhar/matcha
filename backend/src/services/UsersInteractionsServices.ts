import orm from "../lib/orm";
import { Server } from "socket.io";
import pool from "../db/db";
import notificationsServices from "./notificationsServices";
import userServices from "./userServices";

import notificationsEnum from "../types/notificationsType";
import { getSocketIdsByUserId } from "../utils/redis";
import msgsServices from "./msgsServices";

class UsersInteractionsServices {
  private socket: Server | undefined;

  constructor() {
    this.likeAUser = this.likeAUser.bind(this);
    this.unlikeAUser = this.unlikeAUser.bind(this);
    this.getMatches = this.getMatches.bind(this);
  }

  public initSocket(io: Server) {
    this.socket = io;

    this.socket.on("newVisit", async (data: any) => {
      console.log("newVisit", data);

      await this.newVisit(data.user_id, data.visited_id);
    });
  }

  public async likeAUser(body: any) {
    const { user_id, liked_id } = body;
    console.log("user_id", user_id);
    console.log("liked_id", liked_id);
    const alreadyDisliked = await orm.findOne("user_interactions", {
      where: {
        user_id,
        target_user_id: liked_id,
        interaction_type: "dislike",
      },
    });
    const user = await orm.findOne("users", { where: { id: user_id } });

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

    notificationsServices.createNotification(
      liked_id,
      `${user.username} liked your profile`,
      user_id,
      notificationsEnum.like
    );
    await userServices.updateFameRating(liked_id);

    if (mutualLike) {
      // Create a friendship
      const friendship = await orm.create("friendships", {
        user_id,
        friend_id: liked_id,
      });
      const conversation = await orm.create("conversations", {
        user1_id: user_id,
        user2_id: liked_id,
      });
      await msgsServices.createSystemMessage(
        conversation.id,
        "🎉 It's a match! Say hi 👋",
        user_id, // sender_id
        liked_id // recipient_id
      );
      const sender = await userServices.getUsersById(user_id);
      const receiver = await userServices.getUsersById(liked_id);
      notificationsServices.createNotification(
        liked_id,
        `${sender.username} and you are now friends`,
        user_id,
        notificationsEnum.match
      );
      notificationsServices.createNotification(
        user_id,
        `${receiver.username} and you are now friends`,
        liked_id,
        notificationsEnum.match
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
        user_id,
        notificationsEnum.dislike
      );
    }

    return { message: "Dislike added" };
  }

  public async blockAUser(body: any) {
    const { user_id, target_id } = body;

    // Try to update first
    const updated = await orm.querySql(
      `UPDATE user_interactions 
       SET interaction_type = 'block', created_at = NOW() 
       WHERE user_id = $1 AND target_user_id = $2
       RETURNING *`,
      [user_id, target_id]
    );

    if (updated.length === 0) {
      // No existing row → insert new
      await orm.create("user_interactions", {
        user_id,
        target_user_id: target_id,
        interaction_type: "block",
      });
    }

    return { message: "Blocked user" };
  }

  /**
   * IV.3 Browsing: suggested profiles by preferences (orientation, gender),
   * intelligently ordered by proximity, fame rating, shared tags.
   * Orientation not specified → treated as bisexual. Sortable and filterable.
   */
  public async getMatches(
    latitude: number,
    longitude: number,
    distance: number,
    user_id: string,
    age_gap: number,
    interests?: string[] | null,
    options?: { sort?: string; min_rating?: number | null }
  ) {
    const user = await orm.findOne("users", {
      where: { id: user_id },
    });
    // IV.3: If orientation not specified, consider bisexual by default
    const sexual_preference = user?.sexual_preference ?? "bisexual";
    const gender = user?.gender;

    const commonTagsSubquery = `(
      SELECT COUNT(*)
      FROM user_interests ui_me
      JOIN user_interests ui_them ON ui_me.interest_id = ui_them.interest_id AND ui_them.user_id = u.id
      WHERE ui_me.user_id = $4
    )`;

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
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT i.name), NULL) AS interests,
        CEIL(
            ST_Distance(
                ST_GeogFromText('SRID=4326;POINT(' || $2 || ' ' || $1 || ')'),
                u.location
            ) / 1000
        ) AS distance,
        ${commonTagsSubquery}::integer AS common_tags_count
    FROM 
        users u
    LEFT JOIN user_interests ui ON u.id = ui.user_id
    LEFT JOIN interests i ON ui.interest_id = i.id
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
            AND interactions.interaction_type IN ('like', 'dislike', 'block')
        )
        AND u.id != $4
        AND u.age >= $5
        AND u.age <= $6
        AND ($10::integer IS NULL OR u.rating >= $10)
        AND (
            (
                $7 = 'heterosexual' AND $8 = 'male'
                AND u.gender = 'female'
                AND u.sexual_preference IN ('heterosexual', 'bisexual')
            )
            OR (
                $7 = 'heterosexual' AND $8 = 'female'
                AND u.gender = 'male'
                AND u.sexual_preference IN ('heterosexual', 'bisexual')
            )
            OR (
                $7 = 'homosexual' AND $8 = 'male'
                AND u.gender = 'male'
                AND u.sexual_preference IN ('homosexual', 'bisexual')
            )
            OR (
                $7 = 'homosexual' AND $8 = 'female'
                AND u.gender = 'female'
                AND u.sexual_preference IN ('homosexual', 'bisexual')
            )
            OR (
                $7 = 'bisexual' AND $8 = 'male'
                AND (
                    (u.gender = 'female' AND u.sexual_preference IN ('heterosexual', 'bisexual'))
                    OR (u.gender = 'male' AND u.sexual_preference IN ('homosexual', 'bisexual'))
                )
            )
            OR (
                $7 = 'bisexual' AND $8 = 'female'
                AND (
                    (u.gender = 'male' AND u.sexual_preference IN ('heterosexual', 'bisexual'))
                    OR (u.gender = 'female' AND u.sexual_preference IN ('homosexual', 'bisexual'))
                )
            )
        )
        AND (
            $9::integer[] IS NULL OR array_length($9::integer[], 1) IS NULL
            OR EXISTS (
                SELECT 1
                FROM user_interests ui2
                WHERE ui2.user_id = u.id
                AND ui2.interest_id = ANY($9::integer[])
            )
        )
    GROUP BY u.id
    ORDER BY ${this.getMatchesOrderBy(options?.sort)}
    `;

    const min_age = Math.max(18, (user?.age ?? 25) - age_gap);
    const max_age = Math.min(120, (user?.age ?? 25) + age_gap);
    const min_rating = options?.min_rating ?? null;
    const interestIds = interests?.length ? interests : null;

    try {
      const { rows } = await pool.query(query, [
        latitude,
        longitude,
        distance,
        user_id,
        min_age,
        max_age,
        sexual_preference,
        gender,
        interestIds,
        min_rating,
      ]);
      return rows;
    } catch (error) {
      console.error("Error executing query:", error);
      return [];
    }
  }

  /** IV.3: Sort by age, location, fame rating, common tags. Default: proximity then rating then shared tags. */
  private getMatchesOrderBy(sort?: string): string {
    const base =
      "distance ASC NULLS LAST, rating DESC NULLS LAST, common_tags_count DESC NULLS LAST";
    if (!sort) return base;
    switch (sort) {
      case "age_asc":
        return "age ASC NULLS LAST, distance ASC NULLS LAST";
      case "age_desc":
        return "age DESC NULLS LAST, distance ASC NULLS LAST";
      case "distance_asc":
        return "distance ASC NULLS LAST, rating DESC NULLS LAST";
      case "distance_desc":
        return "distance DESC NULLS LAST, rating DESC NULLS LAST";
      case "rating_asc":
        return "rating ASC NULLS LAST, distance ASC NULLS LAST";
      case "rating_desc":
        return "rating DESC NULLS LAST, distance ASC NULLS LAST";
      case "common_tags_asc":
        return "common_tags_count ASC NULLS LAST, distance ASC NULLS LAST";
      case "common_tags_desc":
        return "common_tags_count DESC NULLS LAST, distance ASC NULLS LAST";
      default:
        return base;
    }
  }

  public async checkLike(user_id: string, target_id: string) {
    console.log("user_id", user_id);
    console.log("target_id", target_id);
    // user → target
    const youLiked = await orm.querySql(
      "SELECT 1 FROM user_interactions WHERE user_id = $1 AND target_user_id = $2 AND interaction_type = 'like'",
      [user_id, target_id]
    );

    // target → user
    const theyLiked = await orm.querySql(
      "SELECT 1 FROM user_interactions WHERE user_id = $1 AND target_user_id = $2 AND interaction_type = 'like'",
      [target_id, user_id]
    );

    console.log("youLiked", youLiked);
    console.log("theyLiked", theyLiked);

    return {
      youLiked: youLiked.length > 0,
      theyLiked: theyLiked.length > 0,
      connected: youLiked.length > 0 && theyLiked.length > 0,
    };
  }

  public async newVisit(user_id: string, visited_id: string) {
    await orm.querySql(
      `
      INSERT INTO visits (user_id, visited_id)
      SELECT $1, $2
      WHERE NOT EXISTS (
        SELECT 1 FROM visits WHERE user_id = $1 AND visited_id = $2
      ) `,
      [user_id, visited_id]
    );
    const user = await userServices.getUsersById(user_id);
    await notificationsServices.createNotification(
      visited_id,
      `${user.username} visited your profile`,
      user_id,
      notificationsEnum.visit
    );
    await userServices.updateFameRating(visited_id);
    return;
  }

  public async getFriends(user_id: string) {
    const friends = await orm.querySql(
      `SELECT 
      u.id, 
      u.username, 
      u.email, 
      u.age, 
      u.bio, 
      u.first_name, 
      u.last_name, 
      u.rating,
      c.id AS conversation_id,
      m.content AS last_message,
      m.created_at AS last_message_time
    FROM friendships f
    JOIN users u ON (u.id = f.friend_id OR u.id = f.user_id)
    LEFT JOIN conversations c 
      ON ((c.user1_id = $1 AND c.user2_id = u.id) OR (c.user1_id = u.id AND c.user2_id = $1))
    LEFT JOIN LATERAL (
      SELECT content, created_at
      FROM messages
      WHERE conversation_id = c.id
      ORDER BY created_at DESC
      LIMIT 1
    ) m ON true
    WHERE (f.user_id = $1 OR f.friend_id = $1) 
      AND u.id != $1
    ORDER BY u.username;
    `,
      [user_id]
    );
    const friendsWithDetails = await Promise.all(
      friends.map(async (friend: any) => {
        const user = await orm.findOne("users", {
          where: { id: friend.id },
        });
        return {
          ...friend,
          profile_picture: user?.profile_picture,
        };
      })
    );
    return friendsWithDetails;
  }
}

export default new UsersInteractionsServices();
