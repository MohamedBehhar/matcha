import useCountStore from "@/store/store";
import { getUser } from "@/api/methods/user";
import { useEffect, useState } from "react";
import { updateUserLocation } from "@/api/methods/user";
import { socket } from "@/utils/socket";
import useUserStore from "@/store/userStore";

export default function HomePage() {
  const setUser = useUserStore((state) => state.setUser);
  const id = localStorage.getItem("id");
  const [errro, setError] = useState();
  const updateLocation = async (id: string, data: any) => {
    try {
      const response = await updateUserLocation(id, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const [location, setLocation] = useState({
    city: "",
    region: "",
    country: "",
  });

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
          setUser({
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
  const [ip, setIP] = useState("");
  const fetchIP = async () => {
    try {
      const response = await fetch("https://api64.ipify.org?format=json");
      const data = await response.json();
      setIP(data.ip);
    } catch (err) {
      setError("Failed to fetch IP address.");
    }
  };

  const getFallbackLocation = async () => {
    try {
      const response = await fetch(
        "https://api.ipapi.com/api/" +
          ip +
          "?access_key=" +
          process.env.REACT_APP_IPAPI_KEY
      );
      const data = await response.json();
      setLocation({
        city: data.city,
        region: data.region,
        country: data.country,
      });
    } catch (error) {
      setError("Failed to retrieve location from IP. Please enter manually.");
    }
  };

  const handelGetLocationByIP = async () => {
    await fetchIP().then(() => {
      getFallbackLocation();
    });
  };

  const count = useCountStore((state) => state.count);
  return (
    <main className="flex items-center justify-center h-full ">
      <h1 className="text-6xl">Home Page</h1>
      {count}
    </main>
  );
}
