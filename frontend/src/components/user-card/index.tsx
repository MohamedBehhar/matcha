import React from "react";
import userImg from "@/assets/images/user.png";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { likeAUser, unlikeAUser } from "@/api/methods/interactions";
interface User {
  profilePicture: string;
  name: string;
  age: number;
  distance: number;
  bio: string;
}

const UserCard = ({ user }: { user: User }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const rotate = useTransform(x, [-200, 0, 200], [-45, 0, 45]);
  const user_id = localStorage.getItem("id");

  const handelLikeAUser = async (liked_id: string) => {
    try {
      const body = { user_id, liked_id };
      await likeAUser(body);
      console.log(`User ${liked_id} liked!`);
    } catch (error) {
      console.log(error);
    }
  };

  const handelUnlikeAUser = async (disliked_id: string) => {
    try {
      const body = { user_id, disliked_id };
      await unlikeAUser(body);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDragEnd = (id: string) => {
    if (x.get() > 100) {
      handelLikeAUser(id);
    }
    if (x.get() < 100) {
      handelUnlikeAUser(id);
    }
  };

  return (
    <motion.div
      key={user.id}
      className="hover:cursor-grab active:cursor-grabbing card w-[300px] h-[400px] border border-white rounded-md bg-white text-gray-700 shadow-md "
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
        src={`localhost:3000/${user.profilePicture}`}
        alt="profile"
        className={`w-full  object-cover rounded-t-md `} // Apply blur directly to the front card
        onError={(e: any) => {
          e.target.onerror = null;
          e.target.src = userImg;
        }}
      />
      <div className="info p-1">
        <h1 className="text-xl font-semibold text-center">
          {user.username}, {user.age}
        </h1>
        <p className="text-sm text-center">{user.bio}</p>
        <p className="text-sm text-center">Distance: {user.distance} km</p>
      </div>
    </motion.div>
  );
};

export default UserCard;
