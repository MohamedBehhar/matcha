import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiOutlineHeart } from "react-icons/ai";
import { RiDislikeLine } from "react-icons/ri";
import { Slider } from "@/components/ui/Slider";
import { Input } from "@/components/ui/input";
import { getUsersUnderRadius } from "@/api/methods/geolocation";
import { likeAUser } from "@/api/methods/matchMaking";
import UserCard from "@/components/userCard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import { EffectCards } from "swiper/modules";

const Index = () => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const user_id = localStorage.getItem("id");

  const handelGetUsers = async () => {
    try {
      const response = await getUsersUnderRadius(32.8781073, -6.8894012, 10000, user_id);
      setUsers(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handelLikeAUser = async (user_id, liked_id) => {
    try {
      const body = { user_id, liked_id };
      await likeAUser(body);
      console.log(`User ${liked_id} liked!`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSlideChange = (swiper) => {
    const direction = swiper.activeIndex > currentIndex ? "right" : "left";
    const swipedUser = users[currentIndex]; // Capture user at current index before the swipe

    if (swipedUser) {
      if (direction === "right") {
        console.log('swiper right ')
        handelLikeAUser(user_id, swipedUser.id); // Like action
      } else {
        console.log(`User ${swipedUser.id} disliked!`); // Dislike action
      }
    }
    setCurrentIndex(swiper.activeIndex); // Update index to reflect the new active slide
  };

  useEffect(() => {
    handelGetUsers();
  }, []);

  return (
    <div className="flex flex-col h-screen relative">
      <div className="filters mb-20 flex gap-4 border rounded-md w-[80%] p-4 items-center mx-auto mt-10">
        <div className="filter flex-1 border p-2 rounded-md flex gap-2">
          <label htmlFor="age">Age</label>
          <Slider min={18} max={100} step={1} defaultValue={[18, 100]} label="Age" id="age" />
        </div>
        <div className="filter flex-1 border p-2 rounded-md flex gap-2">
          <label htmlFor="distance">Distance</label>
          <Slider min={0} max={100} step={1} defaultValue={[0, 100]} label="Distance" id="distance" />
        </div>
        <div className="filter flex-1">
          <Input type="text" id="interests" placeholder="Enter interests" />
        </div>
      </div>

      <div className="users relative h-[400px] w-[300px] flex justify-center mx-auto">
        {users.length ? (
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            effect="cards"
            grabCursor={true}
            modules={[EffectCards]}
            onSlideChange={handleSlideChange} // Capture swipe change event
          >
            {users.map((user, index) => (
              <SwiperSlide key={index}>
                <UserCard user={user} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p>No user found</p>
        )}
      </div>

      <div className="flex gap-4 mt-4 z-20 mx-auto">
        <Button
          className="bg-blue-900 text-white p-4 rounded-md"
          onClick={() => {
            const swipedUser = users[currentIndex];
            console.log(`User ${swipedUser?.id} disliked!`);
            setCurrentIndex((prevIndex) => prevIndex + 1); // Move to next user
          }}
        >
          <RiDislikeLine />
        </Button>
        <Button
          className="bg-red-500 text-white p-4 rounded-md"
          onClick={() => {
            const swipedUser = users[currentIndex];
            handelLikeAUser(user_id, swipedUser?.id);
            setCurrentIndex((prevIndex) => prevIndex + 1); // Move to next user
          }}
        >
          <AiOutlineHeart />
        </Button>
      </div>
    </div>
  );
};

export default Index;
