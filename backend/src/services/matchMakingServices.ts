import orm from "../lib/orm";
import { Server } from "socket.io";

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

    const receiver_id = this.userMap.get(liked_id + '');
    if (receiver_id)
      {
        this.socket?.to(receiver_id).emit("like", user_id);
        this.socket?.to(receiver_id).emit("notification");
      } 

    if (mutualLike) {
      // Create a friendship
      const friendship = await orm.create("friendships", {
        user_id,
        friend_id: liked_id,
      });
      this.socket?.to(user_id).emit("match", liked_id);
      this.socket?.to(liked_id).emit("match", user_id);

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
}

export default new MatchMakingServices();
