import axios from "axios";
import instance from "../axios";

const getUser = async () => {
  try {
    const response = await instance.get("/user/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};
const updateUser = async (formData: FormData, id: number) => {
  try {
    const response = await instance.patch(`/user/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
export { getUser, updateUser };
