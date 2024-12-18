import { Outlet } from "react-router";
import Header from "@/components/header";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <main className=" flex flex-col">
      <Toaster />
      <Header />
      <Outlet />
    </main>
  );
}

export default App;
