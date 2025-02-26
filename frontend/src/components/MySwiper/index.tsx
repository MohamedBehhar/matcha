import { getMatches } from "@/api/methods/interactions";
import { useEffect, useState } from "react";
import userImg from "@/assets/images/user.png";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { likeAUser, unlikeAUser } from "@/api/methods/interactions";
import { Button } from "@/components/ui/button";
import { getInterests } from "@/api/methods/interest";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { getUser, updateUserLocation } from "@/api/methods/user";
import useUserStore from "@/store/userStore";

function ZoomHandler({ zoom }: { zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoom); // Update zoom
  }, [zoom, map]);
  return null;
}

function Index() {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const rotate = useTransform(x, [-200, 0, 200], [-45, 0, 45]);
  const [zoom, setZoom] = useState(12);
  const [users, setUsers] = useState([]);
  const [ageGap, setAgeGap] = useState(5);
  const [distance, setDistance] = useState(5);
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const { user, setUserInfos } = useUserStore();

  const fetchInterests = async () => {
    try {
      const response = await getInterests();
      setInterests(response);
    } catch (error) {
      console.error(error);
    }
  };
  const [position, setPosition] = useState([
    user?.latitude || 0,
    user?.longitude || 0,
  ]);
  const getUserInfo = async () => {
    try {
      const response = await getUser();
      setUserInfos(response);
      setPosition([response.latitude, response.longitude]);
    } catch (error) {
      console.error(error);
    }
  };

  const updateLocation = async (id: number, data: any) => {
    if (!id) return;
    try {
      const response = await updateUserLocation(id, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const calculateZoom = (distance: number): number => {
    if (distance <= 5) return 12; // Close view
    if (distance <= 10) return 11;
    if (distance <= 20) return 9;
    if (distance <= 40) return 9;
    if (distance <= 60) return 8;
    if (distance <= 80) return 7;
    return 6.5; // Far view
  };

  useEffect(() => {
    setZoom(calculateZoom(distance));
  }, [distance]);

  const getNewUsers = async () => {
    if (!user) return;
    try {
      const response = await getMatches(
        user?.latitude,
        user?.longitude,
        user?.id,
        ageGap,
        distance * 1000,
        selectedInterests.map((interest: string) => interest.id).join(",") || ""
      );
      setUsers(response);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragEnd = async (id: string) => {
    if (x.get() > 100) {
      await likeAUser({ user_id: user?.id, liked_id: id });
    } else if (x.get() < 100) {
      await unlikeAUser({ user_id: user?.id, disliked_id: id });
    }
    await getNewUsers();
  };

  const handleFetchData = async () => {
    await getUserInfo();
    await fetchInterests();
    await getNewUsers();
  };

  useEffect(() => {
    getNewUsers();
  }, [position]);

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <>
      {user && user?.location ? (
        <div className="   grid grid-cols-12 gap-3">
          <form
            className="filters  border rounded-md w-full p-4 mx-auto mt-10  gap-4 min-h-[400px] col-span-5"
            onSubmit={(e) => {
              e.preventDefault();
              getNewUsers();
            }}
          >
            {user ? (
              <div className="h-[400px] mb-2 rounded-md overflow-hidden">
                <MapContainer
                  center={position}
                  zoom={zoom}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker position={position}>
                    <Popup>Your Location</Popup>
                  </Marker>
                  <Circle
                    center={position}
                    radius={distance * 1000}
                    pathOptions={{ color: "blue", fillOpacity: 0.2 }}
                  />
                  <ZoomHandler zoom={zoom} />
                </MapContainer>
              </div>
            ) : (
              <div className=" row-span-2 flex items-center justify-center flex-col gap-4  ">
                <h1 className="text-3xl font-bold text-center">
                  Please enable location access
                </h1>
                <Link to="/profile" className="text-center text-red-tertiary">
                  Go to profile
                </Link>
              </div>
            )}

            <div className=" row-span-2 flex flex-col gap-2">
              <div className="filter flex-1 border p-2 rounded-md flex items-center gap-5">
                <label htmlFor="age-gap">Age Gap</label>
                <input
                  type="range"
                  id="age-gap"
                  min="0"
                  max="20"
                  value={ageGap}
                  onChange={(e) => setAgeGap(Number(e.target.value))}
                  className="flex-1"
                />
                <p>{ageGap} years</p>
              </div>
              <div className="filter flex-1 border p-2 rounded-md flex items-center gap-5">
                <label htmlFor="distance">Distance</label>
                <input
                  type="range"
                  id="distance"
                  min="0"
                  max="100"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="flex-1"
                />
                <p>{distance} km</p>
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Select cummon interests to match with
                </h2>
                <div className="flex gap-2 items-center flex-wrap">
                  {selectedInterests.map((interest: Interest) => (
                    <Button
                      key={interest.id}
                      type="button"
                      className="bg-red-tertiary text-white"
                    >
                      #{interest.name}
                    </Button>
                  ))}
                </div>
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    type="button"
                    className="bg-gray-300 m-1 text-gray-800 px-2 py-1 rounded-md text-xs"
                    onClick={
                      selectedInterests.includes(interest)
                        ? () =>
                            setSelectedInterests(
                              selectedInterests.filter(
                                (selectedInterest) =>
                                  selectedInterest !== interest
                              )
                            )
                        : () =>
                            setSelectedInterests([
                              ...selectedInterests,
                              interest,
                            ])
                    }
                  >
                    #{interest.name}
                  </button>
                ))}
              </div>

              <Button type="submit" className="bg-red-tertiary text-white mt-4">
                Apply
              </Button>
            </div>
          </form>

          <div className=" grid place-content-center  border rounded-md col-span-7 mt-10">
            {users.length > 0 &&
              users.map((user) => (
                // <motion.div
                //   key={user.id}
                //   className=" card w-[400px] h-[600px] border border-white rounded-md bg-white text-gray-700 shadow-md p-5"
                //   style={{
                //     gridRow: 1,
                //     gridColumn: 1,
                //     opacity: opacity,
                //     x,
                //     rotate,
                //   }}
                //   drag="x"
                //   dragConstraints={{ left: 0, right: 0 }}
                //   onDragEnd={() => handleDragEnd(user.id)}
                // >
                //   <Link to={`/profile/${user.id}`} key={user.id}>
                //     <img
                //       src={`http://localhost:3000/${user.profile_picture}`}
                //       alt="profile"
                //       className={`w-full  object-cover rounded-full aspect-square `} // Apply blur directly to the front card
                //       onError={(e: any) => {
                //         console.log(e);
                //         e.target.onerror = null;
                //         e.target.src = userImg;
                //       }}
                //     />
                //     <div className="info p-1">
                //       <h1 className="text-xl font-semibold text-center">
                //         {user.username}, {user.age}, {user.gender}
                //       </h1>
                //       <p className="text-xl text-center ">
                //         Distance: {user.distance} km
                //       </p>
                //       <p className="text-sm text-center truncate">{user.bio}</p>
                //     </div>
                //   </Link>
                // </motion.div>
                <div
                  key={user.id}
                  className=" card w-[400px] h-[600px]  rounded-lg  
               text-gray-700  flex flex-col justify-end"
                  style={{
                    backgroundImage: `url("http://localhost:3000/${user.profile_picture}")`, // Ensure quotes
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)",
                      background:
                        "linear-gradient(0deg, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)",
                      height: "30%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "1rem",
                    }}
                  >
                    <div className="info p-1">
                      <h1 className="text-xl font-semibold  text-white">
                        {user?.username}, {user?.age}
                      </h1>
                      {user?.interests.map((interest) => (
                        <p className="text-xs text-gray-500 p-1 bg-white w-fit rounded-lg">
                          #{interest.name}
                        </p>
                      ))}
                      <p className="text-xl  text-white">
                        Distance: {user?.distance} km
                      </p>
                      <p className="text-sm  text-white truncate">
                        {user?.bio}
                      </p>
                    </div>
                    <div
                      className="flex justify-between gap-4"
                      style={{ marginTop: "1rem" }}
                    >
                      <Button
                        type="button"
                        className="bg-red-tertiary text-white"
                        onClick={() => handleDragEnd(user.id)}
                      >
                        Dislike
                      </Button>
                      <Button
                        type="button"
                        className="bg-red-tertiary text-white"
                        onClick={() => handleDragEnd(user.id)}
                      >
                        Like
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            {users.length === 0 && (
              <h1 className="text-3xl font-semibold text-center">
                No users found
              </h1>
            )}
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center gap-4 flex-col h-[400px]"
          style={{ marginTop: "10rem" }}
        >
          <p>Please enable location</p>
          <button
            onClick={() => {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setPosition([
                      position.coords.latitude,
                      position.coords.longitude,
                    ]);
                    updateLocation(user?.id, {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                    });
                  },
                  (error) => {
                    console.error("Error getting location:", error.message);
                  }
                );
              } else {
                console.error("Geolocation is not supported by this browser.");
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Enable Location
          </button>
        </div>
      )}
    </>
  );
}

export default Index;
