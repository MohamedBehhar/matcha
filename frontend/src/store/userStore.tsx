import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_authenticated: boolean;
  latitude?: number | null;
  longitude?: number | null;
  bio?: string;
  sexual_preference?: string;
  gender?: string;
  date_of_birth?: string;
  interests?: string[];
  is_data_complete?: boolean;
};

type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // 🔑 single source of truth
      user: null,

      // ✅ login / restore session
      setUser: (user) => set({ user }),

      // ✅ logout (all tabs will react)
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage", // 🔥 REQUIRED for cross-tab sync
    }
  )
);

export default useUserStore;
