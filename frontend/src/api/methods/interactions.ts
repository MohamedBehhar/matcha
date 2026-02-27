import instance from "../axios";

const likeAUser = async (body) => {
  try {
    const response = await instance.post("/interactions/like", body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const unlikeAUser = async (body: any) => {
  console.log("body", body);
  const response = await instance.post("/interactions/unlike", body);
  return response.data;
};




const getMessagesByConversationId = async (conversation_id: string) => {
  if (!conversation_id) {
    throw new Error("Conversation id is required");
  }
  const response = await instance.get(
    `/messages/get-msgs-by-conversation/${conversation_id}`
  );
  return response.data;
};

const saveMsgs = async (user_id: string, msgs: any, type: string) => {
  const response = await instance.post("/messages/save-msgs", {
    user_id,
    msgs,
    type,
  });
  return response.data;
};

const getFriends = async (user_id: string | null) => {
  if (!user_id) {
    throw new Error("User id is required");
  }
  try {
    const response = await instance.get(`/interactions/friends/${user_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export type MatchSort =
  | "age_asc"
  | "age_desc"
  | "distance_asc"
  | "distance_desc"
  | "rating_asc"
  | "rating_desc"
  | "common_tags_asc"
  | "common_tags_desc";

const getMatches = async (
  latitude: number,
  longitude: number,
  user_id: string | null,
  ageGap: number,
  distance: number,
  interests: string | null,
  options?: { sort?: MatchSort; min_rating?: number | null }
) => {
  if (!user_id) {
    throw new Error("User id is required");
  }
  const params = new URLSearchParams({
    user_id,
    latitude: String(latitude),
    longitude: String(longitude),
    distance: String(distance),
    age_gap: String(ageGap),
    interests: interests ?? "",
  });
  if (options?.sort) params.set("sort", options.sort);
  if (options?.min_rating != null && options.min_rating > 0)
    params.set("min_rating", String(options.min_rating));
  try {
    const response = await instance.get(
      `/interactions/matches?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const checkLike = async (user_id: string, liked_id: string) => {
  console.log("user_id", user_id);
  console.log("liked_id", liked_id);
  try {
    const response = await instance.get(
      "/interactions/check-like/" + user_id + "/" + liked_id
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const blockAUser = async (body: any) => {
  try {
    const response = await instance.post("/interactions/block", body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { likeAUser, unlikeAUser, getMatches, checkLike, blockAUser , getFriends ,saveMsgs,getMessagesByConversationId};
