import UserImg from "@/assets/images/user.png";
import { getUserInterests } from "@/api/methods/interest";
import { getUserById } from "@/api/methods/user";
import { useEffect, useState } from "react";
import { IoFemale, IoMale } from "react-icons/io5";
import { FaRegUser, FaHeart, FaRegHeart, FaUserFriends } from "react-icons/fa";
import { MdBlock, MdVerified } from "react-icons/md";
import {
  checkLike,
  likeAUser,
  unlikeAUser,
  blockAUser,
} from "@/api/methods/interactions";
import useUserStore from "@/store/userStore";
import toast from "react-hot-toast";
import { FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { socket } from "@/utils/socket";

function ProfilePage() {
  const [userInfo, setUser] = useState<any>(null);
  const [userInterests, setUserInterests] = useState<any>(null);
  const [youLiked, setYouLiked] = useState(false);
  const [theyLiked, setTheyLiked] = useState(false);
  const [connected, setConnected] = useState(false);
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
        console.log("likeStatus", likeStatus);
        setYouLiked(likeStatus.youLiked);
        setTheyLiked(likeStatus.theyLiked);
        setConnected(likeStatus.connected);
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
      setYouLiked(true);
      if (theyLiked) {
        setConnected(true);
        toast.success("It's a match! 🎉");
      } else {
        toast.success("Liked!");
      }
    } catch (error) {
      toast.error("Failed to like");
    }
  };

  const handleUnlike = async () => {
    try {
      await unlikeAUser({ user_id: user.id, disliked_id: target_id });
      setYouLiked(false);
      setConnected(false);
      toast("Removed like");
    } catch (error) {
      toast.error("Failed to remove like");
    }
  };

  const [blocked, setBlocked] = useState(false);

  const handleBlock = async () => {
    if (!window.confirm("Are you sure you want to block this user?")) return;

    try {
      await blockAUser({ user_id: user.id, target_id });
      setBlocked(true);
      toast.success("User blocked");
      // Optional: redirect to home or another page
      window.location.href = "/match-making";
    } catch (error) {
      toast.error("Block failed");
    }
  };

  useEffect(() => {
    const fetchDataAndTrackVisit = async () => {
      await fetchData();

      if (user?.id && user.id + "" !== target_id) {
        try {
          socket.emit("newVisit", {
            user_id: user.id,
            visited_id: target_id,
          });
        } catch (error) {
          console.error("Error tracking visit:", error);
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
        {userInfo?.profile_picture ? (
          <div className="h-full w-full flex">
            <img
              src={`http://localhost:3000/${userInfo.profile_picture}`}
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
            onClick={blocked ? undefined : handleBlock}
            className="bg-gray-700 w-[55px] p-3 rounded-full shadow-lg text-gray-200 hover:bg-gray-600 transition-colors flex items-center justify-center"
          >
            <MdBlock className="text-2xl" />
          </motion.button>

          {connected ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleUnlike}
              className="p-4 rounded-full shadow-lg bg-green-600 text-white transition-colors"
            >
              <FaUserFriends className="text-2xl" />
            </motion.button>
          ) : youLiked ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleUnlike}
              className="p-4 rounded-full shadow-lg bg-red-primary text-white transition-colors"
            >
              <FaHeart className="text-2xl" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="p-4 rounded-full shadow-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
            >
              <FaRegHeart className="text-2xl" />
            </motion.button>
          )}
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

              {/* Public fame rating (IV.2): 0–100 from profile views + likes received */}
              <div className="flex items-center gap-1 text-gray-300">
                <span className="text-yellow-400 font-medium">★</span>
                <span>Fame {userInfo?.rating ?? 0}/100</span>
              </div>
            </div>
          </div>

          <div className="bg-red-primary text-white p-2 rounded-full">
            <FaRegUser className="text-xl" />
          </div>
        </div>

        {/* Status */}
        <div className="mt-3">
          {connected ? (
            <p className="text-green-400 font-semibold">✅ You are connected</p>
          ) : theyLiked && !youLiked ? (
            <p className="text-yellow-400 font-semibold">
              💌 This user liked you
            </p>
          ) : null}
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
      </motion.div>
    </div>
  );
}

export default ProfilePage;
