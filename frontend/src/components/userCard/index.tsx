import React from "react";

interface User {
  profilePicture: string;
  name: string;
  age: number;
  distance: number;
  bio: string;
}

const UserCard = ({ user }: { user: User }) => {
  return (
<div className="bg-white shadow-lg rounded-lg p-4  min-w-[400px]">
      <img 
        src={user.profilePicture} 
        alt={`${user.name}'s Profile`} 
        className="w-full h-48 rounded-t-lg object-cover"
      />
      <h2 className="text-xl font-semibold mt-2">{user.name}, {user.age}</h2>
      <p className="text-gray-500">{user.distance} miles away</p>
      <p className="mt-1">{user.bio}</p>
    </div>
  );
};

export default UserCard;
