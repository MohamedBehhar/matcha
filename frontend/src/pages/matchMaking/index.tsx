import { useState } from "react";
import { Slider } from "@/components/ui/Slider";
import { Input } from "@/components/ui/input";
import MySwiper from "@/components/MySwiper";
import { Button } from "@/components/ui/button";
import { getInterests } from "@/api/methods/interest";
import { useEffect } from "react";
import { all } from "axios";

const Index = () => {
  const [age, setAge] = useState([24, 40]);
  const [distance, setDistance] = useState(0);
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

  return (
    <div className=" h-screen relative container">

      <MySwiper />
    </div>
  );
};

export default Index;
