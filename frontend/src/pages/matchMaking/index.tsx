import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiOutlineHeart } from "react-icons/ai";
import { RiDislikeLine } from "react-icons/ri";
import { Slider } from "@/components/ui/Slider";
import { Input } from "@/components/ui/input";
import { getUsersUnderRadius } from "@/api/methods/geolocation";
import userImg from "@/assets/images/user.png";
import { likeAUser } from "@/api/methods/matchMaking";

const Index = () => {
  const [users, setUsers] = useState([]);
  const user_id = localStorage.getItem("id");

  const handelGetUsers = async () => {
    try {
      const response = await getUsersUnderRadius(
        32.8781073,
        -6.8894012,
        10000,
        user_id
      );
      setUsers(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handelLikeAUser = async (user_id: string, liked_id: string) => {
    try {
      const body = {
        user_id,
        liked_id,
      };
      await likeAUser(body);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handelGetUsers();
  }, []);

  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState("");

  const handleSwipe = (direction) => {
    setSwipeDirection(direction);
    if (users.length >= 2) setSwiping(true);

    setUsers((prevUsers) => prevUsers.slice(1));
    setTimeout(() => {
      // Remove the first user after the animation completes
      setSwiping(false);
      setSwipeDirection("");
    }, 300); // Duration matches CSS animation
  };

  return (
    <div className="flex flex-col h-screen relative">
      <div className="filters mb-20 flex gap-4 border rounded-md w-[80%] p-4 items-center mx-auto mt-10">
        <div className="filter flex-1 border p-2 rounded-md flex gap-2">
          <label htmlFor="age">Age</label>
          <Slider
            min={18}
            max={100}
            step={1}
            defaultValue={[18, 100]}
            label="Age"
            id="age"
          />
        </div>
        <div className="filter flex-1 border p-2 rounded-md flex gap-2">
          <label htmlFor="distance">Distance</label>
          <Slider
            min={0}
            max={100}
            step={1}
            defaultValue={[0, 100]}
            label="Distance"
            id="distance"
          />
        </div>
        <div className="filter flex-1">
          <Input type="text" id="interests" placeholder="Enter interests" />
        </div>
      </div>

      <div className="users relative h-[400px] w-[300px] flex justify-center mx-auto">
        {users.length > 0 ? (
          users.slice(0, 3).map((user, index) => (
            <div
              key={user.id}
              className={`card w-[300px] h-[400px] border border-white rounded-md bg-white text-gray-700 shadow-md absolute 
              ${index === 0 ? "z-10" : ""}
              ${index === 1 ? "left-[-2px] -rotate-3 z-8" : ""}
              ${index === 2 ? "left-[4px] rotate-3 z-6" : ""}
              ${swiping && index === 0 ? `swipe-${swipeDirection}` : ""}`} // Apply swipe class only to the front card
            >
              <img
                src={user.profilePicture}
                alt="profile"
                className={`w-full h-[80%] object-cover rounded-t-md ${
                  index !== 0 ? "blur-sm" : ""
                }`} // Apply blur directly to the front card
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = userImg;
                }}
              />
              <div className="info p-1">
                <h1 className="text-xl font-semibold text-center">
                  {user.username}, {user.age}
                </h1>
                <p className="text-sm text-center">{user.bio}</p>
                <p className="text-sm text-center">
                  Distance: {user.distance} km
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No more users to display</p>
        )}
      </div>

      <div className="flex gap-4 mt-4 z-20 mx-auto">
        <Button
          className="bg-blue-900 text-white p-4 rounded-md"
          onClick={() => handleSwipe("left")}
        >
          <RiDislikeLine />
        </Button>
        <Button
          className="bg-red-500 text-white p-4 rounded-md"
          onClick={() => {
            handleSwipe("right");
            handelLikeAUser(user_id, users[0].id);
          }}
        >
          <AiOutlineHeart />
        </Button>
      </div>
    </div>
  );
};

export default Index;
