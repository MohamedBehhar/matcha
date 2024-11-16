import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/Slider";
import { Input } from "@/components/ui/input";
import { getUsersUnderRadius } from "@/api/methods/geolocation";
import MySwiper from "@/components/MySwiper";

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

  const [age, setAge] = useState([0, 0]);
  const [distance, setDistance] = useState(0);
  const [interests, setInterests] = useState("");

  useEffect(() => {
    handelGetUsers();
  }, []);

  return (
    <div className="flex flex-col h-screen relative">
      <div className="filters mb-20 flex gap-4 border rounded-md w-[80%] p-4 items-center mx-auto mt-10">
        <div className="filter flex-1 border p-2 rounded-md flex gap-2">
          <label htmlFor="age">Age</label>
          {age}
          <Slider
            min={18}
            max={100}
            step={1}
            defaultValue={age}
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
      <MySwiper age={age} distance={distance} interests={interests} />
    </div>
  );
};

export default Index;
