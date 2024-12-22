import orm from "../lib/orm";
import { Iterest } from "../types/interestsTypes";

class interestsServices {

  constructor() {
    this.getInterests = this.getInterests.bind(this);
  }

  public async getInterests(): Promise<Iterest[]> {
    try {
      const interests = await orm.findMany("interests", {});
      return interests
    } catch (error) {
      console.error("Error fetching interests:", error);
      throw new Error("Database query failed");
    }
  }

  public async getUserInterests(user_id: number): Promise<Iterest[]> {
    try {
      const interests = await orm.querySql(
        `SELECT i.id, i.name
        FROM interests i
        JOIN user_interests ui ON i.id = ui.interest_id
        WHERE ui.user_id = $1`,
        [user_id]
      );
      return interests
    } catch (error) {
      console.error("Error fetching user interests:", error);
      throw new Error("Database query failed");
    }
  }
}


export default new interestsServices();