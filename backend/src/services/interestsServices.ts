import orm from "../lib/orm";
import { Iterest } from "../types/interestsTypes";

class interestsServices {
  public async getInterests(): Promise<Iterest[]> {
    try {
      const interests = await orm.findMany("interests", {});
      return interests
    } catch (error) {
      console.error("Error fetching interests:", error);
      throw new Error("Database query failed");
    }
  }
}


export default new interestsServices();