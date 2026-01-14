import { useEffect } from "react";
import useUserStore from "@/store/userStore";

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === "auth-storage") {
        const data = e.newValue ? JSON.parse(e.newValue) : null;
        useUserStore.setState({ user: data?.state?.user ?? null });
      }
    };

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return <>{children}</>;
}
