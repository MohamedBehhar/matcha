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
    const liked = await orm.findOne("users", { where: { id: liked_id } });
  
    if (!user || !liked) {
      throw new Error("User or liked user not found");
    }
  
    await orm.create("notifications", {
      user_id: liked_id,
      content: `${user.first_name} ${user.last_name} liked you!`,
      sender_id: user_id,
    });
  
    const mutualLike = await orm.findOne("user_interactions", {
      where: {
        user_id: liked_id,
        target_user_id: user_id,
        interaction_type: "like",
      },
    });
  
    const receiver_id = this.userMap.get(`${liked_id}`);
    if (receiver_id) {
      this.socket?.to(receiver_id).emit("like", user_id);
      this.socket?.to(receiver_id).emit("notification");
    }
  
    if (mutualLike) {
      const friendship = await orm.create("friendships", {
        user_id,
        friend_id: liked_id,
      });
  
      const senderSocketId = this.userMap.get(`${user_id}`);
      if (senderSocketId) {
        this.socket?.to(senderSocketId).emit("match", liked);
      }
  
      if (receiver_id) {
        this.socket?.to(receiver_id).emit("match", user);
      }
  
      // WebRTC signaling logic
      this.socket?.on("call-user", ({ offer, targetUserId }: any) => {
        const targetSocketId = this.userMap.get(`${targetUserId}`);
        if (targetSocketId) {
          this.socket?.to(targetSocketId).emit("call-offer", { offer, callerId: senderSocketId });
        }
      });
  
      this.socket?.on("answer-call", ({ answer, callerId }: any) => {
        if (callerId) {
          this.socket?.to(callerId).emit("call-answer", { answer });
        }
      });
  
      this.socket?.on("ice-candidate", ({ candidate, targetUserId }: any) => {
        const targetSocketId = this.userMap.get(`${targetUserId}`);
        if (targetSocketId) {
          this.socket?.to(targetSocketId).emit("ice-candidate", { candidate });
        }
      });
  
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
