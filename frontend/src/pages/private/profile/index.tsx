import UserImg from "@/assets/images/user.png";
import { getUserInterests } from "@/api/methods/interest";
import { getUserById } from "@/api/methods/user";
import { useEffect, useState } from "react";
import { IoFemale, IoMale } from "react-icons/io5";
import { FaRegUser, FaHeart, FaRegHeart } from "react-icons/fa";
import { MdBlock, MdVerified } from "react-icons/md";
import {
  checkLike,
  likeAUser,
  unlikeAUser,
  blockAUser,
} from "@/api/methods/interactions";
import useUserStore from "@/store/userStore";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { socket } from "@/utils/socket";

function ProfilePage() {
  const [userInfo, setUser] = useState<any>(null);
  const [userInterests, setUserInterests] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUserStore();

  const url = window.location.href;
  const target_id = url.split("/").pop() || "";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userData, interestsData] = await Promise.all([
        getUserById(target_id),
        getUserInterests(target_id),
      ]);
      setUser(userData);
      setUserInterests(interestsData);

      if (user?.id) {
        const likeStatus = await checkLike(user.id, target_id);
        setLiked(likeStatus.liked);
      }
    } catch (error) {
      toast.error("Couldn't load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await likeAUser({ user_id: user.id, liked_id: target_id });
      setLiked(true);
      toast.success("Liked!");
    } catch (error) {
      toast.error("Failed to like");
    }
  };

  const handleUnlike = async () => {
    try {
      await unlikeAUser({ user_id: user.id, disliked_id: target_id });
      setLiked(false);
      toast("Removed like");
    } catch (error) {
      toast.error("Failed to remove like");
    }
  };

  const handleBlock = async () => {
    if (window.confirm("Are you sure you want to block this user?")) {
      try {
        await blockAUser({ user_id: user.id, target_id });
        toast.success("User blocked");
        window.location.href = "/";
      } catch (error) {
        toast.error("Block failed");
      }
    }
  };

  useEffect(() => {
    const fetchDataAndTrackVisit = async () => {
      await fetchData();

      // Track visit if user is logged in and viewing someone else's profile
      if (user?.id && user.id + "" !== target_id) {
        try {
          socket.emit("newVisit", {
            user_id: user.id,
            visited_id: target_id,
          });

          // Optional: Show a toast if you want to confirm the visit was tracked
          toast.success("Visit recorded", {
            position: "top-right",
            duration: 2000,
          });
        } catch (error) {
          console.error("Error tracking visit:", error);
          toast.error("Couldn't track visit");
        }
      }
    };

    fetchDataAndTrackVisit();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-primary"></div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 max-w-md">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full inline-block mb-4">
            <FaRegUser className="text-4xl text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Profile Unavailable
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This profile may have been removed or doesn't exist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-gray-900 min-h-screen pb-20">
      {/* Profile Gallery */}
      <div className="relative h-[70vh] max-h-[700px] overflow-hidden">
        {userInfo?.images?.length > 0 ? (
          <div className="h-full w-full flex">
            <img
              src={`http://localhost:3000/${userInfo.images[0].url}`}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = UserImg;
              }}
            />
          </div>
        ) : (
          <div className="h-full w-full bg-gray-800 flex items-center justify-center">
            <FaRegUser className="text-9xl text-gray-600" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Action Buttons */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBlock}
            className="bg-gray-700 p-3 rounded-full shadow-lg text-gray-200 hover:bg-gray-600 transition-colors"
          >
            <MdBlock className="text-xl" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={liked ? handleUnlike : handleLike}
            className={`p-4 rounded-full shadow-lg ${
              liked
                ? "bg-red-primary text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            } transition-colors`}
          >
            {liked ? (
              <FaHeart className="text-2xl" />
            ) : (
              <FaRegHeart className="text-2xl" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mx-4 -mt-16 bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              {userInfo?.username}, {userInfo?.age}
              {userInfo?.verified && (
                <MdVerified className="text-blue-400 text-xl" />
              )}
            </h1>

            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-gray-300">
                {userInfo?.gender === "male" ? (
                  <IoMale className="text-blue-400" />
                ) : (
                  <IoFemale className="text-pink-400" />
                )}
                <span className="capitalize">{userInfo?.gender}</span>
              </div>

              {userInfo?.sexual_preference && (
                <div className="flex items-center gap-1 text-gray-300">
                  <span className="capitalize">
                    {userInfo.sexual_preference}
                  </span>
                </div>
              )}

              {userInfo?.distance && (
                <div className="flex items-center gap-1 text-gray-300">
                  <FaMapMarkerAlt className="text-red-primary" />
                  <span>{Math.round(userInfo.distance)} km away</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-red-primary text-white p-2 rounded-full">
            <FaRegUser className="text-xl" />
          </div>
        </div>

        {/* Bio */}
        {userInfo?.bio && (
          <div className="mt-4">
            <p className="text-gray-300">{userInfo.bio}</p>
          </div>
        )}

        {/* Interests */}
        {userInterests?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-white mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {userInterests.map((interest: any) => (
                <span
                  key={interest.id}
                  className="bg-red-primary/20 text-red-300 px-3 py-1 rounded-full text-sm"
                >
                  #{interest.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Indicators */}
        {userInfo?.images?.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {userInfo.images.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full ${
                  index === 0 ? "w-6 bg-red-primary" : "w-2 bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Additional Photos Grid */}
      {userInfo?.images?.length > 1 && (
        <div className="mt-6 px-4">
          <h3 className="font-semibold text-white mb-3">More Photos</h3>
          <div className="grid grid-cols-2 gap-3">
            {userInfo.images.slice(1).map((image: any, index: number) => (
              <div
                key={index}
                className="aspect-square rounded-xl overflow-hidden border border-gray-700"
              >
                <img
                  src={`http://localhost:3000/${image.url}`}
                  alt={`Profile ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
