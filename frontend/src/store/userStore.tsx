import { create } from "zustand";
import { getUser } from "@/api/methods/user";
import { useLoadingStore } from "@/store/loadingStore"; // Import loading store

type User = {
  id: number | null;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_authenticated: boolean;
  latitude?: number | null;
  longitude?: number | null;
  location?: string;
  bio?: string;
  sexual_preference?: string;
  gender?: string;
  date_of_birth?: string;
  interests?: string[];
  is_data_complete?: boolean;
};

type State = {
  user: User | null;
  setUserInfos: (user: User) => void;
  fetchUserData: () => Promise<void>;
  logout: () => void;
};

const useUserStore = create<State>((set) => ({
  user: null,

  setUserInfos: (user: User) => set({ user }),

  fetchUserData: async () => {
    const { setLoading } = useLoadingStore.getState(); // Access loading store state
    setLoading(true); // Start loading

    try {
      const user = await getUser();
      if (user) {
        set({ user: { ...user, is_authenticated: true } });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  },

  logout: () => set({ user: null }),
}));

export default useUserStore;
