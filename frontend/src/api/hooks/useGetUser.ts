import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/api/methods/user";

export const useGetUser = () => {
  return useQuery({
    queryKey: ["user"],  // Unique query key to avoid unnecessary re-fetching
    queryFn: getUser,    // API function
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
};
