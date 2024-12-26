import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";
import { getImages } from "@/api/methods/pexels";
import { useEffect } from "react";

function index() {
  const [images, setImages] = React.useState([]);
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getImages("profile");
        setImages(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchImages();
  }, []);

  return (
    <div className="container flex items-center justify-center h-screen gap-2">
      <div
        className="profiles-pic flex-1
	 	grid grid-cols-3 gap-4 max-h-[300px] overflow-hidden"
      >
        <div className="flex flex-col gap-2">
          {images.map((image: any, index: number) => (
            <img
              key={index}
              src={image.src.medium}
              alt={image.photographer}
              className="w-full h-full object-cover"
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {images.map((image: any, index: number) => (
            <img
              key={index }
              src={image.src.medium}
              alt={image.photographer}
              className="w-full h-full object-cover top-[-100px]"
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {images.map((image: any, index: number) => (
            <img
              key={index}
              src={image.src.medium}
              alt={image.photographer}
              className="w-full h-full object-cover top-[-100px]"
            />
          ))}
        </div>
      </div>
      <div className="text flex-1 flex flex-col gap-4 ">
        <h1 className="text-4xl font-bold ">Find your partner in life</h1>
        <p>
          We created to bring together amazing singles who want to find love,
          laughter and happily ever after!{" "}
        </p>
        <Button className="bg-red-primary text-white mt-8">Join now</Button>
        <div className="flex gap-2">
          <p>Already have account?</p>
          <Link to="/signin" className="text-red-primary font-bold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default index;
