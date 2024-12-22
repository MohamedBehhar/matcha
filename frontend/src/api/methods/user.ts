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
const updateUser = async (formData: FormData, id: string ) => {
  try {
    console.log("formData", formData);  
    const response = await instance.patch(`/user/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const getUserById = async (id: string) => {
  try {
    const response = await instance.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

const updateUserLocation = async (id: string | null, data: any) => {
  if (!id) return
  try {
    const response = await instance.patch(`/user/${id}/location`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}



export { getUser, updateUser, getUserById, updateUserLocation };
