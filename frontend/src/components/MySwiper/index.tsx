import { getUsersUnderRadius } from "@/api/methods/geolocation";
import { useEffect, useState } from "react";
import userImg from "@/assets/images/user.png";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { likeAUser, unlikeAUser } from "@/api/methods/matchMaking";

function index({
  age,
  distance,
  interests,
}: {
  age: number;
  distance: number;
  interests: string;
}) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const rotate = useTransform(x, [-200, 0, 200], [-45, 0, 45]);
  const user_id = localStorage.getItem("id");
  const latitude = 32.8781073;
  const longitude = -6.8894012;
  const id = localStorage.getItem("id");
  const [users, setUsers] = useState([]);

  const getNewUsers = async () => {
    try {
      const response = await getUsersUnderRadius(
        latitude,
        longitude,
        100000,
        id,
        age,
        distance,
        ""
      );
      console.log(response);
      setUsers(response);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const handelLikeAUser = async (liked_id: string) => {
    try {
      const body = { user_id, liked_id };
      await likeAUser(body);
      await getNewUsers();

      console.log(`User ${liked_id} liked!`);
    } catch (error) {
      console.log(error);
    }
  };

  const handelUnlikeAUser = async (disliked_id: string) => {
    try {
      const body = { user_id, disliked_id };
      await unlikeAUser(body);
      await getNewUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDragEnd = async (id: string) => {
    if (x.get() > 100) {
      await handelLikeAUser(id);
    }
    if (x.get() < 100) {
      await handelUnlikeAUser(id);
    }
  };

  useEffect(() => {
    getNewUsers();
  }, []);

  return (
    <div className="grid min-h-screen   place-items-center ">
      {users.length > 0 &&
        users.map((user) => (
          <motion.div
            key={user.id}
            className="hover:cursor-grab active:cursor-grabbing card w-[300px] h-[400px] border border-white rounded-md bg-white text-gray-700 shadow-md p-5"
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
              <p className="text-xl text-center ">
                Distance: {user.distance} km
              </p>
              <p className="text-sm text-center truncate">{user.bio}</p>
            </div>
          </motion.div>
        ))}
    </div>
  );
}

export default index;
