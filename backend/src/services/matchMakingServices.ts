import orm from "../lib/orm";

class MatchMakingServices {
  public async likeAUser(body: any) {
    const { user_id, liked_id } = body;
    const like = await orm.create("likes", {
      user_id,
      liked_id,
    });
    return like;
  }
}

export default new MatchMakingServices();