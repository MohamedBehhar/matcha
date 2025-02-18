import { Outlet } from "react-router";
import Header from "@/components/header";
import { Toaster } from "react-hot-toast";
import useUserStore from "./store/userStore";
import { useEffect } from "react";
import { getUser } from "./api/methods/user";

function App() {
  const { setUserInfos } = useUserStore();
  useEffect(() => {
    const getUserInfos = async () => {
      try {
        const response = await getUser();
        setUserInfos(response);
      } catch (error) {
        console.log(error);
      }
    };
    getUserInfos();
  }, [setUserInfos]);
  return (
    <main className=" flex flex-col">
      <Toaster />
      <Header />

      <Outlet />
    </main>
  );
}

export default App;
