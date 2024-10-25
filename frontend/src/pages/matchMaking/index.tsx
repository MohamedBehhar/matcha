import UserCard from "@/components/UserCard";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AiOutlineHeart } from "react-icons/ai";
import { RiDislikeLine } from "react-icons/ri";

const Index = () => {
  const [users, setUsers] = useState([
    {
      profilePicture: "https://randomuser.me/api/portraits/men/75.jpg",
      name: "John Doe",
      age: 25,
      distance: 10,
      bio: "Hello, I am a software engineer.",
    },
    {
      profilePicture: "https://randomuser.me/api/portraits/men/76.jpg",
      name: "Jane Smith",
      age: 28,
      distance: 8,
      bio: "Avid traveler and foodie.",
    },
    {
      profilePicture: "https://randomuser.me/api/portraits/men/77.jpg",
      name: "Mike Johnson",
      age: 30,
      distance: 5,
      bio: "Tech enthusiast and gamer.",
    },
  ]);

  const handleSwipe = (direction) => {
    // Add swipe functionality here
    // For now, we just log the direction
    console.log(`Swiped ${direction}`);
  };

  return (
    <div className="flex items-center justify-center flex-col h-screen relative">
      {/* Card Container */}
      <div className="absolute flex items-center justify-center z-10 space-x-4">
        {/* {users.map((user, index) => (
          <div
            key={index}
            className={`transition-transform duration-300 ease-in-out ${
              index === 0 ? "translate-x-0" : "translate-x-[-100%]"
            }`}
          >
            <UserCard user={user} />
          </div>
        ))} */}
      </div>
		<UserCard user={users[0]} />
		<UserCard user={users[1]} />
		<UserCard user={users[2]} />

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4 z-20">
        <Button
          className="bg-blue-900 text-white p-4 rounded-md"
          onClick={() => handleSwipe('left')}
        >
          <RiDislikeLine />
        </Button>
        <Button
          className="bg-red-500 text-white p-4 rounded-md"
          onClick={() => handleSwipe('right')}
        >
          <AiOutlineHeart />
        </Button>
      </div>
    </div>
  );
};

export default Index;
