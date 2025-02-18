import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MySelect from "@/components/ui/MySelect";
import { getInterests } from "@/api/methods/interest";
import { MdOutlineDeleteForever } from "react-icons/md";
import {
  updateUser,
  getUserById,
  updateUserLocation,
  addUserImages,
  getUserImages,
  deleteUserImage,
} from "@/api/methods/user";
import userImg from "@/assets/images/user.png";
import { FaRegStar } from "react-icons/fa6";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textArea";
import { set } from "date-fns";
import useUserStore from "@/store/userStore";

function ProfileSetting() {
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [birthDate, setBirthDate] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const { user, setUserInfos } = useUserStore();

  const getInfo = async () => {
    try {
      if (!user?.id) return;

      const userData = await getUserById(user.id);
      const interestsData = await getInterests();
      const userImages = await getUserImages(String(user.id));

      setUserInfos(userData);
      setProfilePicture(userData.profile_picture);
      setInterests(interestsData);
      setSelectedInterests(userData.interests || []);
      setBirthDate(
        userData.date_of_birth
          ? new Date(userData.date_of_birth).toISOString().split("T")[0]
          : ""
      );

      setSelectedImages(userImages);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (!user?.id) return; // ✅ Ensures the effect runs only when user.id is available
    getInfo();
  }, [user?.id]); // ✅ Re-runs if user.id c

  interface Interest {
    id: number;
    name: string;
  }

  const selectInterest = (interest: Interest) => {
    if (selectedInterests.some((item) => item.id === interest.id)) {
      setSelectedInterests((prevInterests: any) =>
        prevInterests.filter((item: any) => item.id !== interest.id)
      );
      return;
    }
    setSelectedInterests((prevInterests: any) => [...prevInterests, interest]);
  };

  const handleImageChange = (event: any) => {
    const files = event.target.files[0];
    setSelectedImages((prevImages: any) => [...prevImages, files]);
  };

  const handleRemoveImage = (image: any) => {
    if (image instanceof File) {
      setSelectedImages((prevImages: any) =>
        prevImages.filter((img: any) => img !== image)
      );
      return;
    }
    deleteUserImage(image.id)
      .then(() => {
        setSelectedImages((prevImages: any) =>
          prevImages.filter((img: any) => img.id !== image.id)
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handelProfilePicture = (event: any) => {
    const file = event.target.files[0];
    setProfilePicture(file);
  };

  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  const updateLocation = async (id: number, data: any) => {
    try {
      const response = await updateUserLocation(id, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!user.id) return;
          setUserInfos({
            ...user,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          updateLocation(user.id, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            userId: user.id,
          });
          setError(null);
        },
        (error) => {
          setError("Unable to retrieve location.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const handleAddUserImages = async () => {
    const formData = new FormData();
    selectedImages.forEach((image) => {
      formData.append("images", image);
    });
    try {
      const response = await addUserImages(formData, user.id || "");
      setSelectedImages(response);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const formData = new FormData();
    if (profilePicture instanceof File) {
      formData.append("profile_picture", profilePicture);
    }
    formData.append("first_name", event.target.first_name.value);
    formData.append("last_name", event.target.last_name.value);
    formData.append("email", event.target.email.value);
    formData.append("username", event.target.username.value);
    formData.append("bio", event.target.bio.value);
    formData.append("gender", event.target.gender.value);
    formData.append("sexual_preference", event.target.sexual_preference.value);
    formData.append("date_of_birth", event.target.date_of_birth.value);
    formData.append(
      "interests",
      JSON.stringify(selectedInterests.map((interest) => interest.id))
    );
    if (!user.id) return;
    await handleAddUserImages();
    await updateUser(formData, user.id + "")
      .then((data) => {
        setUserInfos(data);
        toast.success("Profile updated successfully");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Failed to update profile");
      });
  };
  const [loading, setLoading] = useState(true);

  return (
    <div className="container flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-center my-5">Profile Setting</h1>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex items-center justify-center  mb-2 rounded-full w-[200px]">
        {profilePicture ? (
          <div className="relative">
            {loading && <p>Loading...</p>} {/* Placeholder while loading */}
            <img
              src={
                profilePicture instanceof File
                  ? URL.createObjectURL(profilePicture)
                  : `http://localhost:3000/${user.profile_picture}`
              }
              alt="profile"
              className="flex-1 w-[200px] aspect-square object-cover rounded-full"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = userImg;
              }}
              onLoad={() => setLoading(false)} // Hide loader when image loads
            />
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center aspect-square rounded-full border p-1 w-full">
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
      </div>
      <div className="rating mb-4 flex gap-1 items-center">
        <FaRegStar />
        <FaRegStar />
        <FaRegStar />
        <FaRegStar />
        <FaRegStar />
      </div>
      <form
        className="w-full max-w-[800px] border p-4 rounded-md"
        onSubmit={handleSubmit}
      >
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-5 w-full mb-4">
          <Input
            type="text"
            name="first_name"
            placeholder="First Name"
            defaultValue={user.first_name}
          />
          <Input
            name="last_name"
            type="text"
            placeholder="Last Name"
            defaultValue={user.last_name}
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            defaultValue={user.email}
          />
          <Input
            name="username"
            type="text"
            placeholder="Username"
            defaultValue={user.username || ""}
          />
          <MySelect
            options={["male", "female"]}
            placeholder="Gender"
            name="gender"
            value={user.gender}
            onChange={(value) => setUserInfos({ ...user, gender: value })}
          />

          <MySelect
            options={["bisexual", "heterosexual", "homosexual"]}
            placeholder="Sexual Preference"
            name="sexual_preference"
            value={user.sexual_preference}
            onChange={(value) =>
              setUserInfos({ ...user, sexual_preference: value })
            }
          />
          {/* <DatePickerDemo
            name="date_of_birth"
            placeholder="Date of birth"
            defaultValue={userInfo.date_of_birth}
            onChange={(date) => console.log(date)}
          /> */}
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            value={birthDate}
            max={
              new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                .toISOString()
                .split("T")[0]
            }
            className="w-full p-2 border rounded-md bg-transparent padding-2"
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        <Textarea
          name="bio"
          placeholder="Bio"
          defaultValue={user.bio}
          className="mb-4"
          maxLength={500}
          rows={5}
        />

        <div className="images grid grid-cols-4 gap-4 mb-4">
          {selectedImages.map((image: any, index) => (
            <div className="flex flex-col items-center relative" key={index}>
              <img
                src={
                  image instanceof File
                    ? URL.createObjectURL(image)
                    : `http://localhost:3000/${image.url}`
                }
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
            {selectedInterests.map((interest: Interest) => (
              <Button
                key={interest.id}
                type="button"
                className="bg-red-tertiary text-white"
              >
                #{interest.name}
              </Button>
            ))}
          </div>
          {interests.map((interest) => (
            <button
              key={interest.id}
              type="button"
              className="bg-gray-300 m-1 text-gray-800 px-2 py-1 rounded-md text-xs"
              onClick={() => selectInterest(interest)}
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
