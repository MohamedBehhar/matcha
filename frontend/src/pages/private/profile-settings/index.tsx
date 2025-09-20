import { useState, useEffect, useCallback } from "react";
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
import { FaRegStar, FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textArea";
import useUserStore from "@/store/userStore";
import axios from "axios";
import LocationPicker from "@/components/LocationPicker";

function ProfileSetting() {
  // State management
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [birthDate, setBirthDate] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { user, setUserInfos } = useUserStore();

  // Fetch user and related data
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, interestsData, userImages] = await Promise.all([
          getUserById(user.id),
          getInterests(),
          getUserImages(String(user.id)),
        ]);

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
        setRating(userData.rating || 0);
        if (userData.latitude && userData.longitude) {
          setLocation({
            latitude: userData.latitude,
            longitude: userData.longitude,
          });
        } else {
          setLocation(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    const fetchLocation = () => {
      const updateLocation = (latitude, longitude) => {
        setUserInfos({
          ...user,
          latitude,
          longitude,
        });

        updateUserLocation(user.id, {
          latitude,
          longitude,
          userId: user.id,
        }).catch((err) => {
          console.error("Failed to update location:", err);
          toast.error("Failed to update location");
        });
      };

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updateLocation(latitude, longitude);
            setError(null);
          },
          async () => {
            try {
              const { data } = await axios.get(
                "https://ipinfo.io/json?access_key=d528a69471b1f2a9ce4d239c07857f2f"
              );
              if (data.loc) {
                const [latitude, longitude] = data.loc.split(",");
                updateLocation(parseFloat(latitude), parseFloat(longitude));
                setError(null);
              } else {
                setError("Unable to retrieve location.");
              }
            } catch (err) {
              console.error("Failed to fetch location from IP API:", err);
              setError("Unable to retrieve location.");
            }
          }
        );
      }
    };

    fetchData();
    fetchLocation();
  }, [user?.id]);

  // Interest selection
  const handleInterestToggle = (interest) => {
    setSelectedInterests((prev) => {
      const isSelected = prev.some((item) => item.id === interest.id);
      return isSelected
        ? prev.filter((item) => item.id !== interest.id)
        : [...prev, interest];
    });
  };

  // Image handling
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select only image files (JPEG, PNG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedImages((prev) => [...prev, file]);
  };

  const handleRemoveImage = (image) => {
    if (image instanceof File) {
      setSelectedImages((prev) => prev.filter((img) => img !== image));
      return;
    }

    deleteUserImage(image.id)
      .then(() => {
        setSelectedImages((prev) => prev.filter((img) => img.id !== image.id));
        toast.success("Image removed");
      })
      .catch(() => {
        toast.error("Failed to remove image");
      });
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select only image files (JPEG, PNG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Image size must be less than 5MB");
      return;
    }

    setProfilePicture(file);
  };

  // Handle saving user images
  const handleAddUserImages = async () => {
    if (!user?.id || selectedImages.length === 0) return selectedImages;

    const formData = new FormData();
    const filesToUpload = selectedImages.filter((img) => img instanceof File);

    if (filesToUpload.length === 0) return selectedImages;

    filesToUpload.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await addUserImages(formData, user.id);
      return response;
    } catch (error) {
      toast.error("Failed to upload images");
      throw error;
    }
  };
  const handleLocationChange = useCallback((newLoc) => {
    setLocation(newLoc);
  }, []);

  // Form submission
  // Form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // Add form fields to formData
      if (profilePicture instanceof File) {
        formData.append("profile_picture", profilePicture);
      }

      const formFields = [
        "first_name",
        "last_name",
        "email",
        "username",
        "bio",
        "gender",
        "sexual_preference",
        "date_of_birth",
      ];

      formFields.forEach((field) => {
        formData.append(field, event.target[field].value);
      });

      formData.append(
        "interests",
        JSON.stringify(selectedInterests.map((interest) => interest.id))
      );

      // Add location if selected
      if (location) {
        formData.append("latitude", String(location.latitude));
        formData.append("longitude", String(location.longitude));
      }

      if (!user.id) {
        throw new Error("User ID not found");
      }

      // First upload images
      const updatedImages = await handleAddUserImages();
      setSelectedImages(updatedImages);

      // Then update user info
      const updatedUser = await updateUser(formData, String(user.id));

      // Update store with location too
      if (location) {
        setUserInfos({
          ...updatedUser,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      } else {
        setUserInfos(updatedUser);
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user?.id) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-primary"></div>
      </div>
    );
  }

  return (
    <div className="dark  px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col items-center mb-8">
          {/* Profile picture */}
          <div className="mb-4 relative group">
            {profilePicture ? (
              <div className="relative">
                <img
                  src={
                    profilePicture instanceof File
                      ? URL.createObjectURL(profilePicture)
                      : `http://localhost:3000/${user.profile_picture}`
                  }
                  alt="Profile"
                  className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-full border-4 border-red-primary shadow-lg"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = userImg;
                  }}
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <span>Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                <span className="text-gray-500 mt-2 text-center text-sm">
                  Upload Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className="cursor-pointer text-xl"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                {star <= (hoveredRating || rating) ? (
                  <FaStar className="text-yellow-400" />
                ) : (
                  <FaRegStar className="text-yellow-400" />
                )}
              </div>
            ))}
            <span className="text-sm text-gray-500 ml-2">({rating || 0})</span>
          </div>
          import LocationPicker from "@/components/LocationPicker"; ...
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {user?.first_name} {user?.last_name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {user?.username || "No username set"}
          </p>
        </div>

        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Personal Information
            </h2>
            <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-5 w-full">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <Input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  defaultValue={user.first_name}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <Input
                  name="last_name"
                  type="text"
                  placeholder="Last Name"
                  defaultValue={user.last_name}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  defaultValue={user.email}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <Input
                  name="username"
                  type="text"
                  placeholder="Username"
                  defaultValue={user.username || ""}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender
                </label>
                <MySelect
                  options={["male", "female"]}
                  placeholder="Gender"
                  name="gender"
                  value={user.gender}
                  onChange={(value) => setUserInfos({ ...user, gender: value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sexual Preference
                </label>
                <MySelect
                  options={["bisexual", "heterosexual", "homosexual"]}
                  placeholder="Sexual Preference"
                  name="sexual_preference"
                  value={user.sexual_preference}
                  onChange={(value) =>
                    setUserInfos({ ...user, sexual_preference: value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={birthDate}
                  max={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 18)
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                  className="w-full p-2 border rounded-md bg-transparent"
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              About Me
            </h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio
              </label>
              <Textarea
                name="bio"
                placeholder="Tell us about yourself..."
                defaultValue={user.bio}
                className="w-full min-h-32"
                maxLength={500}
                rows={5}
              />
              <p className="text-xs text-gray-500 text-right">
                Maximum 500 characters
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Choose Your Location
            </h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300"></label>
              <LocationPicker
                value={location}
                onChange={handleLocationChange}
              />

              {location && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Selected: {location.latitude.toFixed(5)},{" "}
                  {location.longitude.toFixed(5)}
                </p>
              )}
            </div>
          </div>

          {/* Photos */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              My Photos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedImages.map((image, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-lg overflow-hidden shadow border border-gray-200"
                >
                  <img
                    src={
                      image instanceof File
                        ? URL.createObjectURL(image)
                        : `http://localhost:3000/${image.url}`
                    }
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(image)}
                  >
                    <MdOutlineDeleteForever size={20} />
                  </button>
                </div>
              ))}

              {selectedImages.length < 4 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  <span className="text-gray-500 mt-2 text-center text-sm">
                    Add Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can upload up to 4 photos
            </p>
          </div>

          {/* Interests */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6 transition-all">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
              <span className="mr-2">My Interests</span>
              <span className="text-sm font-normal bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {selectedInterests.length} selected
              </span>
            </h2>

            <div className="mb-8">
              <div className="flex flex-wrap gap-3 min-h-16">
                {selectedInterests.length > 0 ? (
                  selectedInterests.map((interest) => (
                    <div key={interest.id} className="group relative">
                      <button
                        type="button"
                        className="bg-gradient-to-r from-red-400 to-red-600 text-white font-medium px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 group-hover:pr-8"
                        onClick={() => handleInterestToggle(interest)}
                      >
                        <span>#{interest.name}</span>
                        <span className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          ✕
                        </span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="w-full flex items-center justify-center py-4 bg-gray-100 dark:bg-gray-600 rounded-lg border border-dashed border-gray-300 dark:border-gray-500">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Select some interests below to help others find you
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-700 pointer-events-none z-10 opacity-0 peer-hover:opacity-100 transition-opacity"></div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="mr-2">Available Interests</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    Tap to select
                  </span>
                </h3>

                <div className="flex flex-wrap gap-2 pb-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {interests
                    .filter(
                      (interest) =>
                        !selectedInterests.some((si) => si.id === interest.id)
                    )
                    .map((interest) => (
                      <button
                        key={interest.id}
                        type="button"
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm border border-gray-200 dark:border-gray-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all hover:scale-105 shadow-sm"
                        onClick={() => handleInterestToggle(interest)}
                      >
                        #{interest.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #ef4444;
              }
            `}</style>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-red-primary hover:bg-red-600 text-white text-lg py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all w-full max-w-xs"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetting;
