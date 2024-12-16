import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/Slider";
import { Input } from "@/components/ui/input";
import { getUsersUnderRadius } from "@/api/methods/geolocation";
import MySwiper from "@/components/MySwiper";
import { Button } from "@/components/ui/button";

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

  const [age, setAge] = useState([18, 100]);
  const [distance, setDistance] = useState(0);
  const [interests, setInterests] = useState("");

  useEffect(() => {
    handelGetUsers();
  }, []);

  return (
    <div className=" h-screen relative container">
      <form className="filters mb-20 flex gap-4 border rounded-md w-full p-4 items-center mx-auto mt-10">
        <div className="filter flex-1 border p-2 rounded-md flex gap-2 items-center r">
          <label htmlFor="age">Min Age</label>
          <p>{age[0]}</p>
          <input type="range" id="age" min="18" max="100" 
            value={age[0]} onChange={(e) => setAge([parseInt(e.target.value), age[1]])} />
        </div>
        <div className="filter flex-1 border p-2 rounded-md flex gap-2 items-center r">
          <label htmlFor="age">Max Age</label>
          <p>{age[0]}</p>
          <input type="range" id="age" min="18" max="100" 
            value={age[0]} onChange={(e) => setAge([parseInt(e.target.value), age[1]])} />
        </div>
        <div className="filter flex-1 border p-2 rounded-md flex gap-2">
          <label htmlFor="distance">Distance</label>
          <Slider
            min={0}
            max={100}
            step={1}
            defaultValue={[100]}
            label="Distance"
            id="distance"
          />
        </div>
        <div className="filter flex-1">
          <Input type="text" id="interests" placeholder="Enter interests" />
        </div>
        <Button onClick={handelGetUsers}>Apply</Button>
      </form>
      <MySwiper age={age} distance={distance} interests={interests} />
    </div>
  );
};

export default Index;
