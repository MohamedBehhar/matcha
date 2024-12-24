import useCountStore from "@/store/store";
import { getUser } from "@/api/methods/user";
import { useEffect, useState } from "react";
import { updateUserLocation } from "@/api/methods/user";
import { socket } from "@/utils/socket";
import useUserStore from "@/store/userStore";
import { set } from "date-fns";

export default function HomePage() {
  const setUserInfos = useUserStore((state) => state.setUserInfos);
  const id = localStorage.getItem("id");
  const [errro, setError] = useState()
  const updateLocation = async (id: string, data: any) => {
    try {
      const response = await updateUserLocation(id, data);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {

          updateLocation(id || "", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            userId: id,
          });
          localStorage.setItem("latitude", position.coords.latitude);
          localStorage.setItem("longitude", position.coords.longitude);
          setUserInfos({
            ...useUserStore.getState().user,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          
          setError(null);
        },
        (error) => {
          setError("Unable to retrieve location.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    getUser().then((data) => console.log(data));
    handleGetLocation();
    socket.on("connect", () => {
      console.log("connected");
      socket.emit("join", id);
    });
  }, []);

  const count = useCountStore((state) => state.count);
  return (
    <main className="grid place-content-center">
      <h1 className="text-6xl">Home Page</h1>
      {count}
    </main>
  );
}
