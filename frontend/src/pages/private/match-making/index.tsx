import { getMatches, likeAUser, unlikeAUser } from "@/api/methods/interactions";
import { getInterests } from "@/api/methods/interest";
import { getUser } from "@/api/methods/user";
import { useEffect, useState } from "react";
import userImg from "@/assets/images/user.png";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import useUserStore from "@/store/userStore";
import toast from "react-hot-toast";
import { getNavigatorLocation } from "@/utils/locationHelper";
import {
  FaHeart,
  FaTimes,
  FaMapMarkerAlt,
  FaRuler,
  FaBirthdayCake,
} from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import { FaVenusMars, FaVenus, FaMars } from "react-icons/fa";

function ZoomHandler({ zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoom);
  }, [zoom, map]);
  return null;
}

function MatchingPage() {
  const [zoom, setZoom] = useState(12);
  const [users, setUsers] = useState([]);
  const [ageGap, setAgeGap] = useState(5);
  const [distance, setDistance] = useState(5);
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user, setUser } = useUserStore();
  const [position, setPosition] = useState([null, null]);

  const calculateZoom = (dist) => {
    if (dist <= 5) return 12;
    if (dist <= 10) return 11;
    if (dist <= 20) return 9;
    if (dist <= 40) return 9;
    if (dist <= 60) return 8;
    if (dist <= 80) return 7;
    return 6.5;
  };

  const fetchInterests = async () => {
    try {
      const res = await getInterests();
      setInterests(res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load interests");
    }
  };

  const getUserInfo = async () => {
    try {
      const res = await getUser();
      setUser(res);
      if (res.latitude && res.longitude) {
        setPosition([res.latitude, res.longitude]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user data");
    }
  };

  const getNewUsers = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await getMatches(
        user.latitude,
        user.longitude,
        user.id,
        ageGap,
        distance * 1000,
        selectedInterests.map((i) => i.id).join(",")
      );
      setUsers(res);
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const like = async (id) => {
    try {
      await likeAUser({ user_id: user.id, liked_id: id });
      toast.success("Liked!");
      nextUser();
    } catch {
      toast.error("Error liking user");
    }
  };

  const unlike = async (id) => {
    try {
      await unlikeAUser({ user_id: user.id, disliked_id: id });
      toast.success("Passed!");
      nextUser();
    } catch {
      toast.error("Error passing on user");
    }
  };

  const nextUser = () => {
    setCurrentIndex((prev) => (prev + 1) % users.length);
    if (users.length === 1) {
      setUsers([]);
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.some((i) => i.id === interest.id)
        ? prev.filter((i) => i.id !== interest.id)
        : [...prev, interest]
    );
  };

  const refreshLocation = async () => {
    try {
      const { coords } = await getNavigatorLocation();
      setPosition([coords.latitude, coords.longitude]);
      setUser({
        ...user,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      toast.success("Location updated!");
    } catch (err) {
      console.error("Error fetching location:", err);
      toast.error("Failed to refresh location");
    }
  };

  useEffect(() => {
    setZoom(calculateZoom(distance));
  }, [distance]);

  useEffect(() => {
    if (position[0] && position[1]) {
      getNewUsers();
    }
  }, [position]);

  useEffect(() => {
    const init = async () => {
      await getUserInfo();
      await fetchInterests();
    };
    init();
  }, []);

  const currentUser = users[currentIndex];

  return (
    <div className="dark min-h-screen  dark:bg-gray-900 p-4 md:p-6 ">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1 ">
          <div className="bg-white dark:bg-gray-800  shadow-lg overflow-hidden h-full  rounded-md">
            <div className="bg-gradient-to-r from-red-primary to-red-600 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaMapMarkerAlt />
                Match Preferences
              </h2>
            </div>

            <div className="p-5 space-y-6">
              {/* Map Display */}
              <div className="h-64 md:h-80 rounded-lg overflow-hidden relative border border-gray-200 dark:border-gray-700">
                {position[0] && position[1] ? (
                  <>
                    <MapContainer
                      center={position}
                      zoom={zoom}
                      style={{ height: "100%", width: "100%" }}
                      zoomControl={false}
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
                        pathOptions={{
                          color: "rgba(239, 68, 68, 0.8)",
                          fillColor: "rgba(239, 68, 68, 0.2)",
                        }}
                      />
                      <ZoomHandler zoom={zoom} />
                    </MapContainer>
                    <button
                      onClick={refreshLocation}
                      className="absolute top-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      title="Refresh location"
                    >
                      <IoMdRefresh className="text-red-primary" />
                    </button>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 p-4 text-center">
                    <FaMapMarkerAlt className="text-red-primary text-3xl mb-2" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Location not available
                    </p>
                    <button
                      onClick={refreshLocation}
                      className="mt-2 text-red-primary hover:underline text-sm"
                    >
                      Enable location access
                    </button>
                  </div>
                )}
              </div>

              {/* Filters */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FaBirthdayCake className="text-red-primary" />
                      Age Range
                    </label>
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">
                      ±{ageGap} years
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={ageGap}
                    onChange={(e) => setAgeGap(+e.target.value)}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FaRuler className="text-red-primary" />
                      Distance
                    </label>
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">
                      {distance} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={distance}
                    onChange={(e) => setDistance(+e.target.value)}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-primary"
                  />
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <h3 className="text-gray-800 dark:text-gray-200 font-medium">
                  Common Interests
                </h3>

                {selectedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedInterests.map((interest) => (
                      <span
                        key={interest.id}
                        className="inline-flex items-center bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-red-200 dark:hover:bg-red-800/50 transition"
                        onClick={() => toggleInterest(interest)}
                      >
                        #{interest.name}
                        <span className="ml-1">×</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-wrap gap-2">
                    {interests
                      .filter(
                        (i) => !selectedInterests.some((si) => si.id === i.id)
                      )
                      .map((interest) => (
                        <button
                          key={interest.id}
                          type="button"
                          className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-xs hover:bg-gray-100 dark:hover:bg-gray-500 transition"
                          onClick={() => toggleInterest(interest)}
                        >
                          #{interest.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={getNewUsers}
                className="w-full bg-red-primary hover:bg-red-600 text-white py-2"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Matching Cards */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800  shadow-lg p-6 h-full rounded-md flex justify-center items-center">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-primary"></div>
              </div>
            ) : users.length > 0 ? (
              <div className="flex flex-col items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentUser.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md p-4 min-w-[400px]"
                  >
                    <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                      {/* Profile Image */}
                      <div className="relative h-96 w-full">
                        <img
                          src={`http://localhost:3000/${currentUser.profile_picture}`}
                          alt={currentUser.first_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = userImg;
                          }}
                        />

                        {/* User Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex items-center  gap-2">
                            <h2 className="text-white text-2xl font-bold">
                              {currentUser.first_name}, {currentUser.age}
                            </h2>
                            {/* Sexual Orientation Icon */}
                            {currentUser.gender && (
                              <div
                                className="flex items-center"
                                title={currentUser.gender}
                              >
                                {currentUser.gender === "female" && (
                                  <FaVenus className="text-red-200" size={26} />
                                )}
                                {currentUser.gender === "male" && (
                                  <FaMars className="text-blue-300" size={26} />
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-white/90 mb-2">
                            <FaMapMarkerAlt size={14} />
                            <span>
                              {Math.round(currentUser.distance)} km away
                            </span>
                          </div>

                          {/* Interests Section */}
                          {currentUser.interests &&
                            currentUser.interests.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-2">
                                  {currentUser.interests.map(
                                    (interest, index) => (
                                      <span
                                        key={index}
                                        className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full"
                                      >
                                        {interest}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-4 bg-white dark:bg-gray-800 flex justify-between">
                        <Button
                          variant="outline"
                          className="rounded-full w-14 h-14 p-0 bg-white hover:bg-gray-100 border-red-300 text-red-primary"
                          onClick={() => unlike(currentUser.id)}
                        >
                          <FaTimes size={20} />
                        </Button>
                        <Link
                          to={`/profile/${currentUser.id}`}
                          className="px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium flex items-center"
                        >
                          View Profile
                        </Link>
                        <Button
                          className="rounded-full w-14 h-14 p-0 bg-red-primary hover:bg-red-600"
                          onClick={() => like(currentUser.id)}
                        >
                          <FaHeart size={20} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Progress Indicator */}
                <div className="mt-6 flex items-center gap-1">
                  {users.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentIndex
                          ? "w-6 bg-red-primary"
                          : "w-2 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center p-6">
                <div className="bg-red-100 dark:bg-red-900/20 text-red-primary dark:text-red-300 p-4 rounded-full mb-4">
                  <FaHeart size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  No matches found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  Try adjusting your filters or expanding your search distance
                </p>
                <Button
                  onClick={getNewUsers}
                  className="bg-red-primary hover:bg-red-600 text-white"
                >
                  Refresh Matches
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchingPage;
