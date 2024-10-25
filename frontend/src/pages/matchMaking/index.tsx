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
      <div className="flex items-center relative  p-5">
        <div className=" top-0 left-0 right-0 bottom-0 bg-white bg-opacity-50 z-20 absolute ">
          <UserCard user={users[0]} />
        </div>
        <div className="absolute top-0 left-10 right-0 bottom-0 bg-white bg-opacity-50 z-10">
          <UserCard user={users[1]} />
        </div>
        <div className="absolute top-0 left-0 right-10 bottom-0 bg-white bg-opacity-50 z-10">
          <UserCard user={users[2]} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4 z-20">
        <Button
          className="bg-blue-900 text-white p-4 rounded-md"
          onClick={() => handleSwipe("left")}
        >
          <RiDislikeLine />
        </Button>
        <Button
          className="bg-red-500 text-white p-4 rounded-md"
          onClick={() => handleSwipe("right")}
        >
          <AiOutlineHeart />
        </Button>
      </div>
    </div>
  );
};

export default Index;
