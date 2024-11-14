import React from "react";
import userImg from "@/assets/images/user.png";

interface User {
  profilePicture: string;
  name: string;
  age: number;
  distance: number;
  bio: string;
}

const UserCard = ({ user }: { user: User }) => {
  return (
    <div
      key={user.id}
      className="card w-[300px] h-[400px] border border-white rounded-md bg-white text-gray-700 shadow-md absolute"
    >

      <img
        src={`localhost:3000/${user.profilePicture}`}
        alt="profile"
        className={`w-full h-[80%] object-cover rounded-t-md `} // Apply blur directly to the front card
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
    </div>
  );
};

export default UserCard;
