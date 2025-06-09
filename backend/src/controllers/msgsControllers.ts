import { Request, Response } from "express";
import { handleResponse } from "../utils/decorators";

import msgsServices from "../services/msgsServices";

class MsgsController {
  constructor() {
    this.getMsgs = this.getMsgs.bind(this);
    this.getMsgsCount = this.getMsgsCount.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.saveMsgs = this.saveMsgs.bind(this);
  }

  @handleResponse()
  public async getConversations(req: Request, res: Response) {
    const user_id = req.params.user_id;
    const conversations = await msgsServices.getUserConversations(
      Number(user_id)
    );
    return conversations as unknown as void;
  }

  @handleResponse()
  public async getMsgs(req: Request, res: Response) {
    const user_id = req.params.user_id;
    const msgs = await msgsServices.getMsgs(user_id);
    return msgs as unknown as void;
  }

  @handleResponse()
  public async markAsRead(req: Request, res: Response) {
    const user_id = req.params.user_id;
    await msgsServices.markAsRead(user_id);
    return { message: "Marked as read" } as unknown as void;
  }

  @handleResponse()
  public async getMsgsCount(req: Request, res: Response) {
    const user_id = req.params.user_id;
    const count = await msgsServices.getMsgsCount(user_id);
    return { count } as unknown as void;
  }

  @handleResponse()
  public async saveMsgs(req: Request, res: Response) {
    const { user_id, msgs } = req.body;
    await msgsServices.saveMsgs(user_id, msgs, "");
    return { message: "Messages saved successfully" } as unknown as void;
  }

  @handleResponse()
  public async getMsgsByConversationId(req: Request, res: Response) {
    const conversation_id = req.params.conversation_id;
    const msgs = await msgsServices.getConversationMessages(
      Number(conversation_id)
    );
    return msgs as unknown as void;
  }
}

export default new MsgsController();
