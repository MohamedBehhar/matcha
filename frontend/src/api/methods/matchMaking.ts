import instance from "../axios";

const likeAUser = async (body: any) => {
  try {
    const response = await instance.post("/matchmaking/like", body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const unlikeAUser = async (body: any) => {
  try {
    const response = await instance.post("/matchmaking/unlike", body);
    return response.data;
  } catch (error) {
    throw error;
  }
}

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
      `/matchmaking/matches?user_id=${user_id}&latitude=${latitude}&longitude=${longitude}&distance=${distance}&age_gap=${ageGap}&interests=${interests}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


export { likeAUser, unlikeAUser, getMatches };