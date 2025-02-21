import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HeartLoader from "@/components/HeartLoader";  // Your HeartLoader component
import { Toaster } from "react-hot-toast";
import Header from "@/components/header";
import { Outlet } from "react-router-dom";

const queryClient = new QueryClient();

function App() {
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
