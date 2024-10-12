import { Outlet } from "react-router";
import Header from "@/components/header";

function App() {
  return (
    <main className=" flex flex-col">
      <Header />
      <Outlet />
    </main>
  );
}

export default App;
