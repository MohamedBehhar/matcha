// import { getMatches } from "@/api/methods/interactions";
// import { useEffect, useState } from "react";
// import userImg from "@/assets/images/user.png";
// import { motion, useMotionValue, useTransform } from "framer-motion";
// import { likeAUser, unlikeAUser } from "@/api/methods/interactions";
// import { Button } from "@/components/ui/button";
// import { getInterests } from "@/api/methods/interest";
// import { Link } from "react-router-dom";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   Circle,
//   useMap,
// } from "react-leaflet";
// import { getUser } from "@/api/methods/user";
// import useUserStore from "@/store/userStore";
// import toast from "react-hot-toast";

// function ZoomHandler({ zoom }: { zoom: number }) {
//   const map = useMap();
//   useEffect(() => {
//     map.setZoom(zoom); // Update zoom
//   }, [zoom, map]);
//   return null;
// }

// function Index() {
//   const x = useMotionValue(0);
//   const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
//   const rotate = useTransform(x, [-200, 0, 200], [-45, 0, 45]);
//   const [zoom, setZoom] = useState(12);
//   const [users, setUsers] = useState([]);
//   const [ageGap, setAgeGap] = useState(5);
//   const [distance, setDistance] = useState(5);
//   const [interests, setInterests] = useState([]);
//   const [selectedInterests, setSelectedInterests] = useState([]);
//   const { user, setUserInfos } = useUserStore();

//   const fetchInterests = async () => {
//     try {
//       const response = await getInterests();
//       setInterests(response);
//     } catch (error) {
//       console.error(error);
//     }
//   };
//   const [position, setPosition] = useState([
//     user?.latitude || 0,
//     user?.longitude || 0,
//   ]);
//   const getUserInfo = async () => {
//     try {
//       const response = await getUser();
//       setUserInfos(response);
//       setPosition([response.latitude, response.longitude]);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const calculateZoom = (distance: number): number => {
//     if (distance <= 5) return 12; // Close view
//     if (distance <= 10) return 11;
//     if (distance <= 20) return 9;
//     if (distance <= 40) return 9;
//     if (distance <= 60) return 8;
//     if (distance <= 80) return 7;
//     return 6.5; // Far view
//   };

//   useEffect(() => {
//     setZoom(calculateZoom(distance));
//   }, [distance]);

//   const getNewUsers = async () => {
//     if (!user) return;
//     try {
//       const response = await getMatches(
//         user?.latitude,
//         user?.longitude,
//         user?.id,
//         ageGap,
//         distance * 1000,
//         selectedInterests.map((interest: string) => interest.id).join(",") || ""
//       );
//       setUsers(response);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const like = async (id: string) => {
//     try {
//       await likeAUser({ user_id: user?.id, liked_id: id });
//       await getNewUsers();
//     } catch (error) {
//       toast.error("Error liking user");
//     }
//   };
//   const unlike = async (id: string) => {
//     try {
//       await unlikeAUser({ user_id: user?.id, disliked_id: id });
//       await getNewUsers();
//     } catch (error) {
//       toast.error("Error unliking user");
//     }
//   };

//   const handleDragEnd = async (id: string) => {
//     if (x.get() > 100) {
//       await likeAUser({ user_id: user?.id, liked_id: id });
//     } else if (x.get() < 100) {
//       await unlikeAUser({ user_id: user?.id, disliked_id: id });
//     }
//     await getNewUsers();
//   };

//   const handleFetchData = async () => {
//     await getUserInfo();
//     await fetchInterests();
//   };

//   useEffect(() => {
//     getNewUsers();
//   }, [position]);

//   useEffect(() => {
//     handleFetchData();
//   }, []);

//   return (
//     <div className="   grid grid-cols-12 gap-3">
//       <form
//         className="filters  border rounded-md w-full p-4 mx-auto mt-10  gap-4 min-h-[400px] col-span-5"
//         onSubmit={(e) => {
//           e.preventDefault();
//           getNewUsers();
//         }}
//       >
//         {user ? (
//           <div className="h-[400px] mb-2 rounded-md overflow-hidden">
//             <MapContainer
//               center={position}
//               zoom={zoom}
//               style={{ height: "100%", width: "100%" }}
//             >
//               <TileLayer
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 attribution="&copy; OpenStreetMap contributors"
//               />
//               <Marker position={position}>
//                 <Popup>Your Location</Popup>
//               </Marker>
//               <Circle
//                 center={position}
//                 radius={distance * 1000}
//                 pathOptions={{ color: "blue", fillOpacity: 0.2 }}
//               />
//               <ZoomHandler zoom={zoom} />
//             </MapContainer>
//           </div>
//         ) : (
//           <div className=" row-span-2 flex items-center justify-center flex-col gap-4  ">
//             <h1 className="text-3xl font-bold text-center">
//               Please enable location access
//             </h1>
//             <Link to="/profile" className="text-center text-red-tertiary">
//               Go to profile
//             </Link>
//           </div>
//         )}

//         <div className=" row-span-2 flex flex-col gap-2">
//           <div className="filter flex-1 border p-2 rounded-md flex items-center gap-5">
//             <label htmlFor="age-gap">Age Gap</label>
//             <input
//               type="range"
//               id="age-gap"
//               min="0"
//               max="20"
//               value={ageGap}
//               onChange={(e) => setAgeGap(Number(e.target.value))}
//               className="flex-1"
//             />
//             <p>{ageGap} years</p>
//           </div>
//           <div className="filter flex-1 border p-2 rounded-md flex items-center gap-5">
//             <label htmlFor="distance">Distance</label>
//             <input
//               type="range"
//               id="distance"
//               min="0"
//               max="100"
//               value={distance}
//               onChange={(e) => setDistance(Number(e.target.value))}
//               className="flex-1"
//             />
//             <p>{distance} km</p>
//           </div>
//           <div>
//             <h2 className="text-xl font-bold">
//               Select cummon interests to match with
//             </h2>
//             <div className="flex gap-2 items-center flex-wrap">
//               {selectedInterests.map((interest: Interest) => (
//                 <Button
//                   key={interest.id}
//                   type="button"
//                   className="bg-red-tertiary text-white"
//                 >
//                   #{interest.name}
//                 </Button>
//               ))}
//             </div>
//             {interests.map((interest) => (
//               <button
//                 key={interest.id}
//                 type="button"
//                 className="bg-gray-300 m-1 text-gray-800 px-2 py-1 rounded-md text-xs"
//                 onClick={
//                   selectedInterests.includes(interest)
//                     ? () =>
//                         setSelectedInterests(
//                           selectedInterests.filter(
//                             (selectedInterest) => selectedInterest !== interest
//                           )
//                         )
//                     : () =>
//                         setSelectedInterests([...selectedInterests, interest])
//                 }
//               >
//                 #{interest.name}
//               </button>
//             ))}
//           </div>

//           <Button type="submit" className="bg-red-tertiary text-white mt-4">
//             Apply
//           </Button>
//         </div>
//       </form>

//       <div className=" grid place-content-center  border rounded-md col-span-7 mt-10">
//         {users.length > 0 &&
//           users.map((user) => (
//             <motion.div
//               key={user.id}
//               className=" card w-[300px] h-[400px] border border-white rounded-md bg-white text-gray-700 shadow-md p-5"
//               style={{
//                 gridRow: 1,
//                 gridColumn: 1,
//                 opacity: opacity,
//                 x,
//                 rotate,
//               }}
//               drag="x"
//               dragConstraints={{ left: 0, right: 0 }}
//               onDragEnd={() => handleDragEnd(user.id)}
//             >
//               <Link to={`/profile/${user.id}`} key={user.id}>
//                 <img
//                   src={`http://localhost:3000/${user.profile_picture}`}
//                   alt="profile"
//                   className={`w-full  object-cover rounded-full aspect-square `} // Apply blur directly to the front card
//                   onError={(e: any) => {
//                     console.log(e);
//                     e.target.onerror = null;
//                     e.target.src = userImg;
//                   }}
//                 />
//                 <div className="info p-1">
//                   <h1 className="text-xl font-semibold text-center">
//                     {user.first_name}, {user.age}, {user.gender}
//                   </h1>
//                   <p className="text-xl text-center ">
//                     Distance: {user.distance} km
//                   </p>
//                   <p className="text-sm text-center truncate">{user.bio}</p>
//                 </div>
//               </Link>
//               <div className="buttons flex items-center justify-between mt-4 gap-5">
//                 <Button
//                   className="bg-gray-300 text-gray-800 flex-1"
//                   onClick={() => unlike(user.id)}
//                 >
//                   dislike
//                 </Button>
//                 <Button
//                   className="bg-red-tertiary text-white flex-1"
//                   onClick={() => like(user.id)}
//                 >
//                   like
//                 </Button>
//               </div>
//             </motion.div>
//           ))}
//         {users.length === 0 && (
//           <h1 className="text-3xl font-semibold text-center">No users found</h1>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Index;

import { getMatches } from "@/api/methods/interactions";
import { useEffect, useState, useCallback } from "react";
import userImg from "@/assets/images/user.png";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
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
import { getUser } from "@/api/methods/user";
import useUserStore from "@/store/userStore";
import toast from "react-hot-toast";
import { IoIosHeart, IoIosHeartDislike } from "react-icons/io";
import { FaMapMarkerAlt, FaRuler, FaBirthdayCake } from "react-icons/fa";
import Badge from "@/components/badge";
// Map zoom handler component
function ZoomHandler({ zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoom);
  }, [zoom, map]);
  return null;
}

function MatchingPage() {
  // Motion values for card swiping
  const x = useMotionValue(0);
  // const opacity = useTransform(x, [-300, 0, 300], [0, 1, 0]);
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30]);
  const scale = useTransform(x, [-300, 0, 300], [0.8, 1, 0.8]);
  // useTransform(x, [0, 100], [0, 1])
  const LikeTransform = useTransform(x, [0, 100], [0, 1]);

  // State management
  const [zoom, setZoom] = useState(12);
  const [users, setUsers] = useState([]);
  const [ageGap, setAgeGap] = useState(5);
  const [distance, setDistance] = useState(5);
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const { user, setUserInfos } = useUserStore();
  const [position, setPosition] = useState([
    user?.latitude || 31.7917, // Default coordinates in case user location is not available
    user?.longitude || -7.0926,
  ]);
  const [showFilters, setShowFilters] = useState(true);

  // Fetch all interests
  const fetchInterests = useCallback(async () => {
    try {
      const response = await getInterests();
      setInterests(response);
    } catch (error) {
      console.error("Failed to fetch interests:", error);
      toast.error("Failed to load interests");
    }
  }, []);

  // Get current user info
  const getUserInfo = useCallback(async () => {
    try {
      const response = await getUser();
      setUserInfos(response);
      if (response.latitude && response.longitude) {
        setPosition([response.latitude, response.longitude]);
      } else {
        toast.error("Location not available. Please update your profile.");
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      toast.error("Failed to load user data");
    }
  }, [setUserInfos]);

  // Calculate appropriate zoom level based on distance
  const calculateZoom = useCallback((distanceKm: number) => {
    if (distanceKm <= 5) return 12; // Close view
    if (distanceKm <= 10) return 11;
    if (distanceKm <= 20) return 10;
    if (distanceKm <= 50) return 9;
    if (distanceKm <= 100) return 7;
    return 5; // Far view
  }, []);

  // Update zoom when distance changes
  useEffect(() => {
    setZoom(calculateZoom(distance));
  }, [distance, calculateZoom]);

  // Fetch potential matches
  const getNewUsers = useCallback(async () => {
    if (!user?.id || !user?.latitude || !user?.longitude) return;

    setIsLoading(true);
    try {
      const response = await getMatches(
        user.latitude,
        user.longitude,
        user.id,
        ageGap,
        distance * 1000, // Convert to meters
        selectedInterests.map((interest) => interest.id).join(",") || ""
      );
      setUsers(response);
      setCurrentUserIndex(0);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      toast.error("Failed to load potential matches");
    } finally {
      setIsLoading(false);
    }
  }, [user, ageGap, distance, selectedInterests]);

  // Handle like/unlike actions
  const handleLike = async (userId) => {
    try {
      await likeAUser({ user_id: user?.id, liked_id: userId });
      toast.success("You liked this profile!");
      nextUser();
    } catch (error) {
      toast.error("Error liking user");
    }
  };

  const handleUnlike = async (userId) => {
    try {
      await unlikeAUser({ user_id: user?.id, disliked_id: userId });
      toast.success("You passed on this profile");
      nextUser();
    } catch (error) {
      toast.error("Error passing on user");
    }
  };

  // Go to next user
  const nextUser = () => {
    if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex((prev) => prev + 1);
    } else {
      // No more users to show
      toast.info("You've seen all potential matches. Refresh for more!");
    }
  };

  // Handle end of swipe gesture
  const handleDragEnd = async (info, userId) => {
    const dragDistance = info.offset.x;

    if (dragDistance > 100) {
      // Swiped right - Like
      await handleLike(userId);
    } else if (dragDistance < -100) {
      // Swiped left - Unlike
      await handleUnlike(userId);
    }

    // Reset position if not enough to trigger action
    return false;
  };

  // Toggle interest selection
  const toggleInterest = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.some((item) => item.id === interest.id)) {
        return prev.filter((item) => item.id !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  // Initialize data
  const initializeData = useCallback(async () => {
    setIsLoading(true);
    try {
      await getUserInfo();
      await fetchInterests();
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getUserInfo, fetchInterests]);

  // Fetch new users when position changes
  useEffect(() => {
    if (position[0] && position[1]) {
      getNewUsers();
    }
  }, [position, getNewUsers]);

  // Initialize on component mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Current user to display
  const currentUser = users[currentUserIndex];

  return (
    <div className="dark p-4 flex-1 h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Filters Panel */}
      <div className="lg:col-span-1 overflow-y-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full  overflow-y-auto ">
          <div className="p-4 bg-gradient-to-r from-red-400 to-red-600 text-white flex justify-between items-center ">
            <h2 className="text-lg font-bold">Match Preferences</h2>
            {/* <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                {showFilters ? "−" : "+"}
              </button> */}
          </div>

          {showFilters && (
            <form
              className="p-5 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                getNewUsers();
              }}
            >
              {/* Map Display */}
              <div className="h-[25rem] rounded-lg overflow-hidden shadow-md">
                {user?.latitude && user?.longitude ? (
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
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <div className="text-center p-4">
                      <FaMapMarkerAlt className="text-red-500 text-3xl mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-300 font-medium">
                        Location not available
                      </p>
                      <Link
                        to="/profile"
                        className="text-red-500 hover:underline text-sm mt-2 block"
                      >
                        Update your profile
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Sliders */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="age-gap"
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <FaBirthdayCake className="text-red-500" /> Age Range
                    </label>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                      ±{ageGap} years
                    </span>
                  </div>
                  <input
                    type="range"
                    id="age-gap"
                    min="0"
                    max="25"
                    value={ageGap}
                    onChange={(e) => setAgeGap(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="distance"
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <FaRuler className="text-red-500" /> Distance
                    </label>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                      {distance} km
                    </span>
                  </div>
                  <input
                    type="range"
                    id="distance"
                    min="1"
                    max="100"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-3 ">
                <h3 className="text-gray-800 dark:text-gray-200 font-medium">
                  Common Interests
                </h3>

                {selectedInterests.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-2">
                      {selectedInterests.map((interest) => (
                        <Badge
                          key={interest.id}
                          className="bg-red-500 hover:bg-red-600 cursor-pointer flex items-center gap-1 px-3 py-1 text-white"
                          onClick={() => toggleInterest(interest)}
                        >
                          #{interest.name} <span className="ml-1">×</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {interests
                      .filter(
                        (interest) =>
                          !selectedInterests.some((si) => si.id === interest.id)
                      )
                      .map((interest) => (
                        <button
                          key={interest.id}
                          type="button"
                          className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-md text-xs hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                          onClick={() => toggleInterest(interest)}
                        >
                          #{interest.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2"
              >
                Apply Filters
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Matches Display */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center   ">
        <div className="relative w-full max-w-md min-h-[40rem] flex items-center justify-center">
          {isLoading ? (
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-lg bg-gray-200 h-80 w-64"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mt-4"></div>
              <div className="h-3 bg-gray-200 rounded w-24 mt-2"></div>
            </div>
          ) : users.length > 0 && currentUser ? (
            <AnimatePresence>
              <motion.div
                key={currentUser.id}
                className="absolute w-full max-w-xs "
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="card bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden h-full "
                  style={{ x, rotate, scale }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => handleDragEnd(info, currentUser.id)}
                  whileTap={{ cursor: "grabbing" }}
                >
                  {/* <motion.div
                      className="absolute left-5 top-5 bg-red-500 text-white p-2 rounded-full z-10"
                      style={{ opacity: useTransform(x, [0, -100], [0, 1]) }}
                    >
                      <IoIosHeartDislike size={24} />
                    </motion.div> */}

                  <motion.div
                    className="absolute right-5 top-5 bg-green-500 text-white p-2 rounded-full z-10"
                    style={{ opacity: LikeTransform }}
                  >
                    <IoIosHeart size={24} />
                  </motion.div>

                  {/* User Profile Picture and Info */}

                  <div className="relative w-full h-80">
                    <img
                      src={`http://localhost:3000/${currentUser.profile_picture}`}
                      alt={`${currentUser.first_name}'s profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = userImg;
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h2 className="text-white text-2xl font-bold">
                        {currentUser.first_name}, {currentUser.age}
                      </h2>
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <FaMapMarkerAlt />
                        <span>{Math.round(currentUser.distance)} km away</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-200 text-gray-700">
                        {currentUser.gender}
                      </Badge>
                      {currentUser.sexual_preference && (
                        <Badge className="bg-gray-200 text-gray-700">
                          {currentUser.sexual_preference}
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[3em]">
                      {currentUser.bio || "No bio provided"}
                    </p>

                    {currentUser.interests &&
                      currentUser.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {currentUser.interests.slice(0, 5).map((interest) => (
                            <span
                              key={interest.id}
                              className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"
                            >
                              #{interest.name}
                            </span>
                          ))}
                          {currentUser.interests.length > 5 && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                              +{currentUser.interests.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between gap-2">
                    <Button
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
                      onClick={() => handleUnlike(currentUser.id)}
                    >
                      <IoIosHeartDislike className="mr-2" /> Pass
                    </Button>
                    <Link
                      to={`/profile/${currentUser.id}`}
                      className="px-4 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-center text-sm font-medium"
                    >
                      View Profile
                    </Link>
                    <Button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleLike(currentUser.id)}
                    >
                      <IoIosHeart className="mr-2" /> Like
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg min-h-full flex flex-col items-center justify-center">
              <div className="mb-4 bg-red-100 text-red-500 p-4 rounded-full inline-block">
                <IoIosHeart size={90} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                No matches found
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Try adjusting your filters or expanding your search area
              </p>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={getNewUsers}
              >
                Refresh
              </Button>
            </div>
          )}
        </div>

        {/* Cards progress indicator */}
        {users.length > 0 && (
          <div className="mt-6 flex items-center gap-1">
            {users.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all ${
                  index === currentUserIndex
                    ? "w-8 bg-red-500"
                    : index < currentUserIndex
                    ? "w-2 bg-gray-300"
                    : "w-2 bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchingPage;
