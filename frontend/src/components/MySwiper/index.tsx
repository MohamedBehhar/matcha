import { getMatches } from "@/api/methods/interactions";
import { useEffect, useState } from "react";
import userImg from "@/assets/images/user.png";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
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
import { IoMdMale } from "react-icons/io";
import { IoMdFemale } from "react-icons/io";
import { IoMale } from "react-icons/io5";
import { FaCircleMinus, FaCirclePlus } from "react-icons/fa6";

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
  const [isFocused, setIsFocused] = useState(false);
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
  useEffect(() => {
    getNewUsers();
  }, [ageGap, distance]);

  const handleDragEnd = async (id: string | number) => {
    if (!id) return;

    const currentX = x.get();

    if (currentX > 100) {
      await likeAUser({ user_id: user?.id, liked_id: id });
    } else if (currentX < -100) {
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

  const handleIncrementAge = () => setAgeGap((prev) => Math.min(prev + 1, 100));
  const handleDecrementAge = () => setAgeGap((prev) => Math.max(prev - 1, 0));

  return (
    <>
      {user && user?.location ? (
        <div className="   grid grid-cols-12 gap-3">
          <form
            className="filters   rounded-md w-full p-4 mx-auto mt-10  gap-4 min-h-[400px] col-span-5"
            onSubmit={(e) => {
              e.preventDefault();
              getNewUsers();
            }}
          >
            <div className="h-[400px] flex flex-col  rounded-md overflow-hidden  ">
              <div className="h-[80%] rounded-lg">
                <MapContainer
                  center={position}
                  zoom={zoom}
                  style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: "10px",
                  }}
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
              <div className="filter flex-1  p-2 rounded-md flex items-center gap-5 w-full  mt-1">
                <label
                  htmlFor="distance"
                  className="text-red-primary text-2xl font-semibold"
                >
                  Distance
                </label>
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
            </div>

            <div className=" row-span-2 flex flex-col gap-2 ">
              <div className="filter flex-1  rounded-md flex items-center gap-5 ">
                <h1 className="text-red-primary text-2xl font-semiboldy">
                  Age gap
                </h1>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  className=" text-white p-2 rounded-full w-10 h-10 flex items-center justify-center"
                  onClick={handleDecrementAge}
                >
                  <FaCircleMinus size={30} />
                </motion.button>

                {/* Animated Value */}
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={ageGap}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold   "
                  >
                    {ageGap}
                  </motion.div>
                </AnimatePresence>

                {/* Plus Button */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  className=" text-white p-2 rounded-full w-10 h-10 flex items-center justify-center"
                  onClick={handleIncrementAge}
                >
                  <FaCirclePlus size={30} />
                </motion.button>
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

          <div className=" grid place-content-center   rounded-md col-span-7 mt-10">
            {users.length > 0 &&
              users.map((user) => (
                <motion.div
                  key={user.id}
                  className="w-[400px] h-[600px] rounded-[1rem] bg-white text-gray-700 shadow-md flex flex-col justify-end overflow-hidden"
                  style={{
                    gridRow: 1,
                    gridColumn: 1,
                    opacity,
                    x,
                    rotate,
                    backgroundImage: `url("http://localhost:3000/${user.profile_picture}")`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd(user?.id)} // Detect swipe end
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(0deg, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)",
                      height: "40%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "1rem",
                    }}
                  >
                    <div className="info p-1">
                      <div className="text-2xl  font-bold text-white flex items-center justify-between mb-1">
                        <h1>
                          {user?.username}, {user?.age}
                        </h1>
                        <span>
                          {user?.gender == "male" ? (
                            <IoMale size={30} color="blue" />
                          ) : (
                            <IoMdFemale size={30} color="pink" />
                          )}
                        </span>
                      </div>
                      {user?.interests.map((interest) => (
                        <span
                          key={interest.name}
                          className="text-xs text-gray-500 p-1 bg-white w-fit rounded-lg mr-1"
                        >
                          #{interest.name}
                        </span>
                      ))}
                      <p className="text-xl text-white">
                        Distance: {user?.distance} km
                      </p>
                      <p className="text-sm text-white truncate">{user?.bio}</p>
                    </div>
                    <div className="flex justify-between gap-4 mt-4">
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg"
                        onClick={() =>
                          handleDragEnd(null, { offset: { x: -200 } })
                        }
                      >
                        Dislike
                      </button>
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded-lg"
                        onClick={() =>
                          handleDragEnd(null, { offset: { x: 200 } })
                        }
                      >
                        Like
                      </button>
                    </div>
                  </div>
                </motion.div>
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
