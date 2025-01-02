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
import { getUser } from "@/api/methods/user";

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
  const user_id = localStorage.getItem("id");
  const id = localStorage.getItem("id");
  const [users, setUsers] = useState([]);
  const [ageGap, setAgeGap] = useState(5);
  const [distance, setDistance] = useState(5);
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [user, setUser] = useState(null);

  const fetchInterests = async () => {
    try {
      const response = await getInterests();
      setInterests(response);
    } catch (error) {
      console.error(error);
    }
  };
  const [position, setPosition] = useState([0, 0]);
  const getUserInfo = async () => {
    try {
      const response = await getUser();
      setUser(response);
      setPosition([response.latitude, response.longitude]);
    } catch (error) {
      console.error(error);
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
    try {
      const response = await getMatches(
        user?.latitude,
        user?.longitude,
        id,
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
      await likeAUser({ user_id, liked_id: id });
    } else if (x.get() < 100) {
      await unlikeAUser({ user_id, disliked_id: id });
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
                            (selectedInterest) => selectedInterest !== interest
                          )
                        )
                    : () =>
                        setSelectedInterests([...selectedInterests, interest])
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
            <motion.div
              key={user.id}
              className=" card w-[300px] h-[400px] border border-white rounded-md bg-white text-gray-700 shadow-md p-5"
              style={{
                gridRow: 1,
                gridColumn: 1,
                opacity: opacity,
                x,
                rotate,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={() => handleDragEnd(user.id)}
            >
              <img
                src={`http://localhost:3000/${user.profile_picture}`}
                alt="profile"
                className={`w-full  object-cover rounded-full aspect-square `} // Apply blur directly to the front card
                onError={(e: any) => {
                  console.log(e);
                  e.target.onerror = null;
                  e.target.src = userImg;
                }}
              />
              <div className="info p-1">
                <h1 className="text-xl font-semibold text-center">
                  {user.username}, {user.age}, {user.gender}
                </h1>
                <p className="text-xl text-center ">
                  Distance: {user.distance} km
                </p>
                <p className="text-sm text-center truncate">{user.bio}</p>
              </div>
            </motion.div>
          ))}
        {users.length === 0 && (
          <h1 className="text-3xl font-semibold text-center">No users found</h1>
        )}
      </div>
    </div>
  );
}

export default Index;
