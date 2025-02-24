import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HeartLoader from "@/components/HeartLoader"; // Your HeartLoader component
import { Toaster } from "react-hot-toast";
import Header from "@/components/header";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import  useUserStore  from "@/store/userStore";

const queryClient = new QueryClient();

function App() {
  const { fetchUserData } = useUserStore();
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex">
        <Toaster />
        <HeartLoader />
        <Header />
        <Outlet />
      </main>
    </QueryClientProvider>
  );
}

export default App;
