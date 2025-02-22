import { create } from "zustand";
import { getUser } from "@/api/methods/user";

type User = {
  id: number | null;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_authenticated: boolean;
  latitude?: number | null;
  longitude?: number | null;
  bio?: string;
  sexual_preference ?: string;
  gender ?: string;
  date_of_birth ?: string;
  interests ?: string[];
  is_data_complete?: boolean;
};

type State = {
  user: User;
  setUserInfos: (user: User) => void; 
};

type Actions = {
  
  logout: () => void;
  logUser: (user: User) => void;
};

const useUserStore = create<State & Actions>((set) => ({
  user: {
    id: null,
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    bio: "",
    sexual_preference: "",
    gender: "",
    date_of_birth: "",
    is_authenticated: false,
    latitude: null,
    longitude: null,
    interests: [],
    is_data_complete: false,
  },
  setUserInfos: (user: User) => {
    set({ user });
  },
  logUser: (user: User) =>
    set({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        is_authenticated: true,
        latitude: user.latitude || null,
        longitude: user.longitude || null,
        bio: user.bio || "",
        sexual_preference: user.sexual_preference || "",
        gender: user.gender || "",
        date_of_birth: user.date_of_birth || "",
        interests: user.interests || [],
        is_data_complete: user.is_data_complete || false,
      },
    }),
  logout: () =>
    set({
      user: {
        id: null,
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        is_authenticated: false,
        latitude: null,
        longitude: null,
        bio: "",
        sexual_preference: "",
        gender: "",
        date_of_birth: "",
        interests: [],
      },
    }),
}));

export default useUserStore;
