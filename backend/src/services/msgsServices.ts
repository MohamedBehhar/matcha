import orm from "../lib/orm";
import { Server } from "socket.io";
import { getSocketIdFromRedis } from "../utils/redis";

type Message = {
  id?: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  is_read: boolean;
  type: string;
};

type Conversation = {
  id?: number;
  user1_id: number;
  user2_id: number;
};

class MsgsServices {
  private socket: Server | undefined;
  private userMap: Map<string, string> = new Map();

  constructor() {
    this.getMsgs = this.getMsgs.bind(this);
    this.getMsgsCount = this.getMsgsCount.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
  }

  public initSocket(io: Server, userMap: Map<string, string>) {
    this.socket = io;
    this.userMap = userMap;
  }

  // 📦 Conversations Handling
  public async getOrCreateConversation(
    user1_id: number,
    user2_id: number
  ): Promise<number> {
    try {
      // Check for existing conversation (in both directions)
      const existing = await orm.querySql(
        `
        SELECT * FROM conversations 
        WHERE (user1_id = $1 AND user2_id = $2)
           OR (user1_id = $2 AND user2_id = $1)
        LIMIT 1
        `,
        [user1_id, user2_id]
      );

      if (existing.length > 0) return existing[0].id;

      // Create conversation if not found
      const newConv = await orm.create("conversations", {
        user1_id,
        user2_id,
      });

      return newConv.id;
    } catch (error) {
      console.error("error creating conversation", error);
      throw error;
    }
  }

  public async getUserConversations(user_id: number) {
    try {
      const conversations = await orm.querySql(
        `SELECT c.id, c.user1_id, c.user2_id,
		CASE WHEN c.user1_id = $1 THEN u2.username ELSE u1.username END AS other_username,
		CASE WHEN c.user1_id = $1 THEN u2.id ELSE u1.id END AS other_user_id
		FROM conversations c
		JOIN users u1 ON c.user1_id = u1.id
		JOIN users u2 ON c.user2_id = u2.id
		WHERE c.user1_id = $1 OR c.user2_id = $1`,
        [user_id]
      );
      if (!conversations || conversations.length === 0) {
        return [];
      }
      return conversations;
    } catch (error) {
      console.error("error fetching conversations", error);
      return [];
    }
  }

  // 📦 Messages Handling
  public async getMsgs(user_id: string): Promise<Message[]> {
    try {
      const msgs = await orm.findMany("messages", {
        where: { recipient_id: user_id },
      });
      return msgs;
    } catch (error) {
      console.log("error", error);
    }
    return [];
  }

  public async getMsgsCount(user_id: string): Promise<number> {
    try {
      const msgs = await orm.findMany("messages", {
        where: { recipient_id: user_id },
      });
      return msgs.length;
    } catch (error) {
      console.log("error", error);
    }
    return 0;
  }

  public async markAsRead(user_id: string): Promise<void> {
    try {
      await orm.querySql(
        `
        UPDATE messages
        SET is_read = TRUE
        WHERE recipient_id = $1 AND is_read = FALSE
        `,
        [user_id]
      );

      const receiver_id = await getSocketIdFromRedis(user_id);
      if (receiver_id) {
        this.socket?.to(receiver_id).emit("msgsRead");
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  public async saveMsgs(
    sender_id: string,
    recipient_id: string,
    content: string,
    type: string = "text"
  ): Promise<void> {
    try {
      const conversation_id = await this.getOrCreateConversation(
        Number(sender_id),
        Number(recipient_id)
      );

      await orm.create("messages", {
        conversation_id,
        content,
        sender_id,
        recipient_id,
        is_read: false,
        type,
      });

      const recipientSocketId = this.userMap.get(String(recipient_id));
      if (recipientSocketId) {
        this.socket?.to(recipientSocketId).emit("receive_message");
      }
    } catch (error) {
      console.log("error", error);
    }
  }
}

export default new MsgsServices();
