import instance from "../axios";

const likeAUser = async (body: any) => {
  console.log("body", body);
  try {
    const response = await instance.post("/interactions/like", body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const unlikeAUser = async (body: any) => {
  console.log("body", body);
  try {
    const response = await instance.post("/interactions/unlike", body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getMatches = async (
  latitude: number,
  longitude: number,
  user_id: string | null,
  ageGap: number,
  distance: number,
  interests: string | null
) => {
  if (!user_id) {
    throw new Error("User id is required");
  }
  try {
    const response = await instance.get(
      `/interactions/matches?user_id=${user_id}&latitude=${latitude}&longitude=${longitude}&distance=${distance}&age_gap=${ageGap}&interests=${interests}`
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
    const response = await instance.post("/matchmaking/block", body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { likeAUser, unlikeAUser, getMatches, checkLike, blockAUser };
