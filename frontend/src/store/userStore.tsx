import { create } from "zustand";

type User = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_authenticated: boolean;
  latitude?: number;
  longitude?: number;
};

type State = {
  user: User;
  setUserInfos: (user: User) => void; // Changed user from string to User object
};

type Actions = {
  logout: () => void;
  logUser: (user: User) => void;
};

const useUserStore = create<State & Actions>((set) => ({
  user: {
    id: -1,
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    is_authenticated: false,
    latitude: 0,
    longitude: 0,
  },
  setUserInfos: (user: User) => {
    set({ user })
  
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
        latitude: user.latitude || 0,
        longitude: user.longitude || 0,
      },
    }),
  logout: () =>
    set({
      user: {
        id: -1,
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        is_authenticated: false,
        latitude: 0,
        longitude: 0,
      },
    }),
}));

export default useUserStore;