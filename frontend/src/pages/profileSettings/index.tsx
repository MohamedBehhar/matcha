import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MySelect from "@/components/ui/MySelect";
import { getInterests } from "@/api/methods/interest";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { updateUser } from "@/api/methods/user";


function ProfileSetting() {
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    getInterests()
      .then((data) => {
        console.log(data);
        setInterests(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const selectInterest = (name: string) => {
    setSelectedInterests((prevSelected: any) =>
      prevSelected.includes(name)
        ? prevSelected.filter((interest: any) => interest !== name)
        : [...prevSelected, name]
    );
  };

  const handleImageChange = (event: any) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setSelectedImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleRemoveImage = (image: any) => {
    setSelectedImages((prevImages) =>
      prevImages.filter((img) => img !== image)
    );
  };
  const [profilePicture, setProfilePicture] = useState("");
  const handelProfilePicture = (event: any) => {
    const file = event.target.files[0];
    console.log(file);
    setProfilePicture(
      file
    );
  };

  const handleSubmit = (event: any) => {
    const id = 1;
    event.preventDefault();
    const formData = new FormData();
    formData.append("profile_picture", profilePicture);
    formData.append("first_name", event.target.first_name.value);
    formData.append("last_name", event.target.last_name.value);
    formData.append("email", event.target.email.value);
    formData.append("username", event.target.username.value);
    formData.append("bio", event.target.bio.value);
    formData.append("gender", event.target.gender.value);
    formData.append("sexual_preference", event.target.sexual_preference.value);
    console.log("formData", formData);
    updateUser(formData, id)
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="container flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center my-5">Profile Setting</h1>
      <div className="flex items-center justify-center  p-4 rounded-full w-[300px]">
        {profilePicture ? (
          <div className=" relative ">
            <img
              src={
                profilePicture
                  ? URL.createObjectURL(profilePicture)
                  : "https://randomuser.me/api/portrait"
              }
              alt="profile"
              className="flex-1 max-w-[200px] rounded-full"
            />
            <FaRegEdit className="absolute top-0 right-0" 
            onClick={() => setProfilePicture('')}
            />
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center aspect-square rounded-full border p-1">
            <span className="text-gray-500 text-center text-xs">
              Click to upload an image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handelProfilePicture}
              className="hidden"
            />
          </label>
        )}
        {/* <img
          src="https://randomuser.me/api/portraits/men/75.jpg"
          alt="profile"
          className="flex-1 max-w-[200px] rounded-full"
        /> */}
      </div>
      <form className="w-full max-w-[800px] border p-4 rounded-md"
        onSubmit={handleSubmit}
      >
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-5 w-full mb-4">
          <Input type="text" name="first_name" placeholder="First Name" />
          <Input name="last_name" type="text" placeholder="Last Name" />
          <Input name="email" type="email" placeholder="Email" />
          <Input name="username" type="text" placeholder="Username" />
          <MySelect options={["male", "female"]} placeholder="Gender" name="gender"/>
          <MySelect
            options={["male", "female"]}
            placeholder="Sexual preferences"
            name="sexual_preference"
          />
        </div>
        <Input name="bio" type="text" placeholder="Bio" className="mb-4" />
        <div className="images grid grid-cols-4 gap-4 mb-4">
          {selectedImages.map((image, index) => (
            <div className="flex flex-col items-center relative" key={index}>
              <img
                src={image}
                alt={`Preview ${index}`}
                className="rounded-md mb-4 w-full aspect-square object-cover "
              />
              <MdOutlineDeleteForever
                className="text-red-primary text-xl mt-1 absolute right-1 bg-gray-100 rounded-sm opacity-70 cursor-pointer"
                onClick={() => handleRemoveImage(image)}
              />
            </div>
          ))}
          {selectedImages.length < 4 && (
            <label className="cursor-pointer flex flex-col items-center justify-center aspect-square rounded-md border p-1">
              <span className="text-gray-500 text-center">
                Click to upload an image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                multiple
              />
            </label>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold">Select your interests</h2>
          <div className="flex gap-2 items-center flex-wrap">
            {selectedInterests.map((interest, index) => (
              <Button
                key={index}
                type="button"
                className="bg-red-tertiary text-white"
              >
                #{interest}
              </Button>
            ))}
          </div>
          {interests.map((interest, index) => (
            <button
              key={index}
              type="button"
              className="bg-gray-300 m-1 text-gray-800 px-2 py-1 rounded-md text-xs"
              onClick={() => selectInterest(interest.name)}
            >
              #{interest.name}
            </button>
          ))}
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-primary text-white bg-red-primary text-xl max-w-[300px] "
        >
          Save
        </Button>
      </form>
    </div>
  );
}

export default ProfileSetting;
