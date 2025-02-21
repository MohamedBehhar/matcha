import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/api/methods/user";

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Retry once if it fails
  });
};
