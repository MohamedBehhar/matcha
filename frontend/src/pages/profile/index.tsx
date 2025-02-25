import React from "react";
import CoverImg from "@/assets/images/cover.png";
import UserImg from "@/assets/images/user.png";
import { getUserById, getUser } from "@/api/methods/user";
import { getUserInterests } from "@/api/methods/interest";
import { useEffect, useState } from "react";
import { IoFemale } from "react-icons/io5";
import { IoMdMale } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { FaRegHeart } from "react-icons/fa";
import { FaHeartBroken } from "react-icons/fa";
import { MdBlock } from "react-icons/md";
import {
  checkLike,
  likeAUser,
  unlikeAUser,
  blockAUser,
} from "@/api/methods/interactions";
import { socket } from "@/utils/socket";
import useUserStore from "@/store/userStore";

function index() {
  const { user, setUserInfos } = useUserStore();
  const [userInterests, setUserInterests] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const url = window.location.href;
  const target_id = url.split("/").pop() || "";
  const user_id = user?.id || "";
  const [targetData, setTargetData] = useState<any>(null);

  const handelGetUserInfo = async () => {
    try {
      const data = await getUserById(target_id);
      setTargetData(data);
    } catch (error) {
      console.error("Error getting user:", error);
    }
  };
  const handelGetUserInterests = async () => {
    try {
      const data = await getUserInterests(target_id);
      setUserInterests(data);
    } catch (error) {
      console.error("Error getting user interests:", error);
    }
  };

  const handelCheckLike = async () => {
    if (!user_id) return;
    try {
      const response = await checkLike(user_id + "", target_id);
      console.log("response", response);
      setLiked(response.liked);
    } catch (error) {
      console.error("Error checking like:", error);
    }
  };

  const returnAdequateButtons = () => {
    return (
      <div
        className="absolute bottom-4 right-4 flex gap-2
        "
      >
        {liked == true ? (
          <>
            <Button
              className="flex gap-2"
              onClick={async () => {
                try {
                  await unlikeAUser({ user_id, disliked_id: target_id });
                  handelCheckLike();
                } catch (error) {
                  console.error("Error unliking user:", error);
                }
              }}
            >
              <FaHeartBroken />

              <p>Unlike</p>
            </Button>
            <Button
              className="flex gap-2"
              onClick={async () => {
                try {
                  await blockAUser({ user_id, target_id });
                  handelCheckLike();
                } catch (error) {
                  console.error("Error blocking user:", error);
                }
              }}
            >
              <MdBlock />
              <p>Block</p>
            </Button>
          </>
        ) : (
          <>
            <Button
              className="flex gap-2"
              onClick={async () => {
                try {
                  await likeAUser({ user_id, liked_id: target_id });
                  handelCheckLike();
                } catch (error) {
                  console.error("Error liking user:", error);
                }
              }}
            >
              <FaRegHeart />
              <p>Like</p>
            </Button>
            <Button
              className="flex gap-2"
              onClick={async () => {
                try {
                  await blockAUser({ user_id, target_id });
                  handelCheckLike();
                } catch (error) {
                  console.error("Error blocking user:", error);
                }
              }}
            >
              <MdBlock />
              <p>Block</p>
            </Button>
          </>
        )}
      </div>
    );
  };

  useEffect(() => {
    handelGetUserInfo();
    handelGetUserInterests();
    handelCheckLike();
    socket.emit("newVisit", { user_id, visited_id: target_id });
  }, []);
  return (
    <div className="container  h-full mt-[100px] border-t border-gray-600">
      <div className="conver  relative">
        {/* <img
          src={CoverImg}
          alt="cover"
          className="object-cover h-full w-full"
        /> */}

        {returnAdequateButtons()}
      </div>
      <div className=" grid grid-cols-12 flex-1  ">
        <div
          className="info col-span-4 flex flex-col gap-3
          relative pt-[80px] text-center p-4  capitalize border-r border-gray-600"
        >
          <img
            src={
              targetData?.profile_picture
                ? `http://localhost:3000/${targetData?.profile_picture}`
                : UserImg
            }
            alt="profile"
            className="profile h-[150px] aspect-square rounded-[50%] absolute -top-[75px] left-1/2 transform -translate-x-1/2 object-cover"
          />
          <div className="flex items-end justify-center gap-1 text-4xl">
            <FaRegUser />
            <p className="mb-0">
              {targetData?.username + ", "} {targetData?.age}
            </p>
          </div>
          <p className="text-gray-400">{liked ? "true" : "false"}</p>
          <div className="flex justify-center gap-1 items-center text-xl">
            {targetData?.gender == "male" ? <IoMdMale /> : <IoFemale />}
            <p>{targetData?.gender}</p>, <p>{targetData?.sexual_preference}</p>
          </div>
          <p className="text-gray-400 border border-gray-600 rounded-md p-1 italic">
            {targetData?.bio}
          </p>
          <div>
            <div className="flex flex-wrap gap-2 justify-center">
              {userInterests?.map((interest: any) => (
                <p
                  key={interest.id}
                  className="bg-red-primary text-white rounded-md px-2 py-1 "
                >
                  #{interest.name}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="activities col-span-8 ">
          <div className="flex flex-col  items-center justify-center gap-2 p-1">
            {targetData?.images?.map((image: any) => (
              <img
                src={`http://localhost:3000/${image.url}`}
                alt="profile"
                className="w-[300px] h-[300px] object-cover rounded-md "
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default index;
