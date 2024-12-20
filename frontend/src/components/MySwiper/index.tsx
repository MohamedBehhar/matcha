import { getMatches } from "@/api/methods/matchMaking";
import { useEffect, useState } from "react";
import userImg from "@/assets/images/user.png";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { likeAUser, unlikeAUser } from "@/api/methods/matchMaking";
import { Button } from "@/components/ui/button";
import { getInterests } from "@/api/methods/interest";

function index() {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const rotate = useTransform(x, [-200, 0, 200], [-45, 0, 45]);
  const user_id = localStorage.getItem("id");
  const latitude = 32.8781073;
  const longitude = -6.8894012;
  const id = localStorage.getItem("id");
  const [users, setUsers] = useState([]);

  const [ageGap, setAgeGap] = useState(5);
  const [distance, setDistance] = useState(5);
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);

  const fetchInterests = async () => {
    try {
      const response = await getInterests();
      setInterests(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const getNewUsers = async () => {
    try {
      const response = await getMatches(
        latitude,
        longitude,
        id,
        ageGap,
        distance * 1000,
        selectedInterests.map((interest: string) => interest.id).join(",") || ""
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
    } else if (x.get() < 100) {
      await handelUnlikeAUser(id);
    }
  };

  useEffect(() => {
    getNewUsers();
  }, []);

  const getNewMatches = async (e: any) => {
    e.preventDefault();
    try {
      const response = await getMatches(
        latitude,
        longitude,
        id,
        ageGap,
        distance * 1000,
        selectedInterests.map((interest: string) => interest.id).join(",") || ""
      );
      setUsers(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className=" ">
      <form
        className="filters mb-20   border rounded-md w-full p-4  mx-auto mt-10 flex flex-col gap-4"
        onSubmit={getNewMatches}
      >
        <div className="flex gap-2 items-center ">
          <div className="filter flex-1 border p-2 rounded-md flex  items-center relative gap-5">
            <label htmlFor="age-gap">
              Age Gap 
            </label>
            <input
              type="range"
              id="age-gap"
              min="0"
              max="20"
              value={ageGap}
              onChange={(e) => setAgeGap(parseInt(e.target.value))}
              className=" flex-1 "
            />
            <p>
            {ageGap} years
            </p>
          </div>
          <div className="filter flex-1 border p-2 rounded-md flex gap-2">
            <label htmlFor="distance">Distance </label>
            <input
              type="range"
              id="distance"
              min="0"
              max="100"
              value={distance}
              onChange={(e) => setDistance(parseInt(e.target.value))}
              className=" flex-1 "
            />
            <p>
              {distance} km
            </p>
          </div>
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
                  : () => setSelectedInterests([...selectedInterests, interest])
              }
            >
              #{interest.name}
            </button>
          ))}
        </div>
        <Button className="bg-red-tertiary text-white mt-4" type="submit">
          Apply
        </Button>
      </form>
      <div className=" grid min-h-screen   place-items-center">
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
        {users.length === 0 && (
          <h1 className="text-3xl font-semibold text-center">No users found</h1>
        )}
      </div>
    </div>
  );
}

export default index;
