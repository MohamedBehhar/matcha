import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMale, FaFemale } from "react-icons/fa";
import { BsX } from "react-icons/bs";
import { RiImageAddLine } from "react-icons/ri";
import { FiChevronsRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radioGroup";
import { Label } from "@/components/ui/label";
import useUserStore from "@/store/userStore";
import { 
  updateUser, 
  addUserImages,
  updateUserLocation 
} from "@/api/methods/user";
import { getInterests } from "@/api/methods/interest";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import axios from "axios";
import LocationPicker from "@/components/LocationPicker";
import { MdOutlineDeleteForever } from "react-icons/md";

// Types
interface User {
  gender: string;
  sexual_preference: string;
  bio: string;
  latitude?: number;
  longitude?: number;
}

interface Interest {
  id: number;
  name: string;
}

// Steps Constants
const TOTAL_STEPS = 7;
const STEP_TITLES = [
  "Add your birthdate",
  "Select your gender",
  "Select your sexual preference",
  "Write a short bio",
  "Select your interests",
  "Upload a profile picture",
  "Add more photos"
];

// Reusable Animation Wrapper
const AnimatedStep = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// Progress Dots
const ProgressIndicator = ({ step }: { step: number }) => (
  <div className="flex flex-col gap-4 mb-6 justify-center items-center">
    <div className="flex gap-8">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full ${
            i + 1 <= step ? "bg-red-primary" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
    <h1 className="text-lg font-semibold">
      {STEP_TITLES[step - 1]}
    </h1>
  </div>
);

// Next Button
const NextButton = ({
  onClick,
  disabled = false,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 bg-red-primary hover:bg-red-600 text-white"
    type="button"
  >
    Next <FiChevronsRight />
  </Button>
);

// Step 1: Birthdate
const Step1 = ({
  birthDate,
  setBirthDate,
}: {
  birthDate: string;
  setBirthDate: (val: string) => void;
}) => (
  <AnimatedStep>
    <div className="flex flex-col items-center gap-6">
      <p className="text-gray-500">You must be at least 18 years old</p>
      <input
        type="date"
        value={birthDate}
        max={
          new Date(new Date().setFullYear(new Date().getFullYear() - 18))
            .toISOString()
            .split("T")[0]
        }
        onChange={(e) => setBirthDate(e.target.value)}
        className="p-3 border rounded-lg bg-transparent w-72 text-center"
      />
    </div>
  </AnimatedStep>
);

// Step 2: Gender
const Step2 = ({
  user,
  setUser,
}: {
  user: User;
  setUser: (u: User) => void;
}) => (
  <AnimatedStep>
    <div className="flex justify-center gap-8">
      <Button
        variant="ghost"
        className={`w-40 h-40 flex flex-col items-center justify-center rounded-xl transition-all ${
          user.gender === "female" 
            ? "border-2 border-red-primary " 
            : "border "
        }`}
        onClick={() => setUser({ ...user, gender: "female" })}
        type="button"
      >
        <FaFemale size={90} className="text-red-primary mb-2" />
        <span className="text-lg">Female</span>
      </Button>
      <Button
        variant="ghost"
        className={`w-40 h-40 flex flex-col items-center justify-center rounded-xl transition-all ${
          user.gender === "male" 
            ? "border-2 border-blue-primary " 
            : "border "
        }`}
        onClick={() => setUser({ ...user, gender: "male" })}
        type="button"
      >
        <FaMale size={90} className="text-blue-primary mb-2" />
        <span className="text-lg">Male</span>
      </Button>
    </div>
  </AnimatedStep>
);

// Step 3: Sexual Preference
const Step3 = ({
  user,
  setUser,
}: {
  user: User;
  setUser: (u: User) => void;
}) => (
  <AnimatedStep>
    <div className="flex flex-col items-center gap-6">
      <p className="text-gray-500">Who are you interested in?</p>
      <RadioGroup
        value={user.sexual_preference}
        onValueChange={(value) => setUser({ ...user, sexual_preference: value })}
        className="flex flex-col gap-4"
      >
        {[
          { value: "heterosexual", label: "Opposite gender" },
          { value: "homosexual", label: "Same gender" },
          { value: "bisexual", label: "Both genders" }
        ].map((pref) => (
          <div key={pref.value} className="flex items-center space-x-4 p-3 border rounded-lg">
            <RadioGroupItem value={pref.value} id={pref.value} />
            <Label htmlFor={pref.value} className="text-lg cursor-pointer">
              {pref.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  </AnimatedStep>
);

// Step 4: Bio
const Step4 = ({
  user,
  setUser,
}: {
  user: User;
  setUser: (u: User) => void;
}) => (
  <AnimatedStep>
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <p className="text-gray-500 text-center mb-2">
        Tell others about yourself. What makes you unique?
      </p>
      <Textarea
        placeholder="I love hiking, coding, and trying new cuisines..."
        value={user.bio}
        onChange={(e) => setUser({ ...user, bio: e.target.value })}
        maxLength={500}
        rows={6}
        className="w-full"
      />
      <div className="flex justify-between w-full text-sm text-gray-500">
        <span>Be creative!</span>
        <span>{user.bio?.length || 0}/500 characters</span>
      </div>
    </div>
  </AnimatedStep>
);



// Step 5: Interests
const Step5 = ({
  interests,
  selectedInterests,
  toggleInterest,
}: {
  interests: Interest[];
  selectedInterests: Interest[];
  toggleInterest: (interest: Interest) => void;
}) => (
  <AnimatedStep>
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
      <p className="text-gray-500 text-center">
        Select interests that describe you. This helps find better matches!
      </p>
      
      {/* Selected Interests */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Selected ({selectedInterests.length})</h3>
          <span className="text-sm text-gray-500">Tap to remove</span>
        </div>
        <div className="flex flex-wrap gap-2 min-h-20 p-4 border rounded-lg bg-gray-50">
          {selectedInterests.length > 0 ? (
            selectedInterests.map((interest) => (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest)}
                className="bg-gradient-to-r from-red-400 to-red-600 text-white font-medium px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 group"
              >
                #{interest.name}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
              </button>
            ))
          ) : (
            <div className="w-full text-center py-4 text-gray-500">
              No interests selected yet
            </div>
          )}
        </div>
      </div>

      {/* Available Interests */}
      <div className="w-full">
        <h3 className="font-medium mb-3">Available Interests</h3>
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg max-h-60 overflow-y-auto">
          {interests
            .filter(interest => !selectedInterests.some(si => si.id === interest.id))
            .map((interest) => (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest)}
                className="bg-white text-gray-700 px-4 py-2 rounded-full border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all hover:scale-105"
              >
                #{interest.name}
              </button>
            ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center mt-4">
        Select at least 3 interests for better matches
      </p>
    </div>
  </AnimatedStep>
);

// Step 6: Profile Picture
const Step6 = ({
  profilePicture,
  setProfilePicture,
}: {
  profilePicture: File | null;
  setProfilePicture: (f: File | null) => void;
}) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    
    setProfilePicture(file);
  };

  return (
    <AnimatedStep>
      <div className="flex flex-col items-center gap-6">
        <p className="text-gray-500 text-center">
          Choose a great profile picture! This is the first thing people will see.
        </p>
        
        {profilePicture ? (
          <div className="relative">
            <img
              src={URL.createObjectURL(profilePicture)}
              alt="Profile preview"
              className="w-64 h-64 object-cover rounded-full border-4 border-red-primary shadow-lg"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              onClick={() => setProfilePicture(null)}
            >
              <BsX size={24} />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer group">
            <div className="w-64 h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-full hover:border-red-primary transition-colors hover:bg-red-50">
              <RiImageAddLine size={80} className="text-gray-400 group-hover:text-red-primary transition-colors" />
              <p className="mt-4 text-gray-500 group-hover:text-red-primary transition-colors">
                Upload Profile Picture
              </p>
              <p className="text-sm text-gray-400 mt-2">Click to select</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        )}
        
        <div className="text-center text-sm text-gray-500">
          <p>• JPG, PNG, or WebP format</p>
          <p>• Max file size: 5MB</p>
          <p>• Square images work best</p>
        </div>
      </div>
  </AnimatedStep>
  );
};

// Step 7: Additional Photos
const Step7 = ({
  photos,
  setPhotos,
}: {
  photos: File[];
  setPhotos: (files: File[]) => void;
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - photos.length;
    const newFiles = files.slice(0, remainingSlots);
    
    const validFiles = newFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      return true;
    });
    
    setPhotos([...photos, ...validFiles]);
    
    if (files.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more photo(s)`);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  return (
    <AnimatedStep>
      <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
        <p className="text-gray-500 text-center">
          Add up to 4 more photos to showcase your personality!
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
          {photos.map((photo, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border shadow-sm"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <MdOutlineDeleteForever size={20} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 rounded-b-lg">
                <p className="text-white text-sm">Photo {index + 1}</p>
              </div>
            </div>
          ))}
          
          {photos.length < 5 && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <RiImageAddLine size={40} className="text-gray-400 mb-2" />
              <span className="text-gray-500">Add Photo</span>
              <span className="text-xs text-gray-400 mt-1">
                {5 - photos.length} remaining
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />
            </label>
          )}
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Upload at least 2 photos for better matches!</p>
          <p className="text-xs mt-1">({photos.length}/5 photos uploaded)</p>
        </div>
      </div>
    </AnimatedStep>
  );
};

// Main Component
const CompleteProfile = () => {
  const { user, setUser } = useUserStore();
  const [step, setStep] = useState(1);
  const [birthDate, setBirthDate] = useState("");
  const [profileData, setProfileData] = useState<User>({
    gender: "",
    sexual_preference: "",
    bio: "",
  });
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch available interests
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const data = await getInterests();
        setInterests(data);
      } catch (error) {
        console.error("Failed to fetch interests:", error);
        toast.error("Could not load interests");
      }
    };
    
    fetchInterests();
  }, []);

  const toggleInterest = (interest: Interest) => {
    setSelectedInterests(prev => {
      const isSelected = prev.some(item => item.id === interest.id);
      if (isSelected) {
        return prev.filter(item => item.id !== interest.id);
      } else {
        return [...prev, interest];
      }
    });
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const isNextDisabled = () => {
    switch (step) {
      case 1: return !birthDate;
      case 2: return !profileData.gender;
      case 3: return !profileData.sexual_preference;
      case 4: return !profileData.bio?.trim() || profileData.bio.length < 10;
      case 5: return selectedInterests.length < 3;
      case 6: return !profilePicture;
      case 7: return photos.length < 2;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // 1. First, upload profile picture and additional photos
      const formData = new FormData();
      
      // Add basic user info
      formData.append("date_of_birth", birthDate);
      formData.append("gender", profileData.gender);
      formData.append("sexual_preference", profileData.sexual_preference);
      formData.append("bio", profileData.bio);
      
      // Add interests
      formData.append("interests", JSON.stringify(selectedInterests.map(i => i.id)));
      
      // Add profile picture
      if (profilePicture) {
        formData.append("profile_picture", profilePicture);
      }
      
      // 2. Update user info
      const updatedUser = await updateUser(formData, user.id.toString());
      
      // 3. Upload additional photos if any
      if (photos.length > 0) {
        const photosFormData = new FormData();
        photos.forEach(photo => {
          photosFormData.append("images", photo);
        });
        await addUserImages(photosFormData, user.id);
      }
      
      // 4. Update store and redirect
      setUser({
        ...updatedUser,
        is_data_complete: true
      });
      
      toast.success("Profile completed successfully!");
      navigate("/match-making");
      
    } catch (error) {
      console.error("Failed to complete profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (step === TOTAL_STEPS) {
            handleSubmit();
          } else {
            handleNext();
          }
        }}
        className="w-full max-w-4xl rounded-2xl shadow-xl p-8"
      >
        <ProgressIndicator step={step} />
        
        <h1 className="text-3xl font-bold text-center mb-2">
          Complete Your Profile
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Step {step} of {TOTAL_STEPS}
        </p>

        {/* Step Content */}
        <div className="min-h-[400px] flex items-center justify-center">
          {step === 1 && <Step1 birthDate={birthDate} setBirthDate={setBirthDate} />}
          {step === 2 && <Step2 user={profileData} setUser={setProfileData} />}
          {step === 3 && <Step3 user={profileData} setUser={setProfileData} />}
          {step === 4 && <Step4 user={profileData} setUser={setProfileData} />}
          {step === 5 && (
            <Step5
              interests={interests}
              selectedInterests={selectedInterests}
              toggleInterest={toggleInterest}
            />
          )}
          {step === 6 && (
            <Step6
              profilePicture={profilePicture}
              setProfilePicture={setProfilePicture}
            />
          )}
          {step === 7 && <Step7 photos={photos} setPhotos={setPhotos} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <div>
            {step > 1 && (
              <Button
                onClick={handlePrevious}
                type="button"
                variant="outline"
                className="px-6"
              >
                Back
              </Button>
            )}
          </div>
          
          <div>
            {step < TOTAL_STEPS ? (
              <NextButton 
                onClick={handleNext} 
                disabled={isNextDisabled()} 
              />
            ) : (
              <Button
                type="submit"
                disabled={isNextDisabled() || loading}
                className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Step Requirements */}
        <div className="mt-6 pt-4 border-t text-sm text-gray-500 text-center">
          {step === 1 && "You must be at least 18 years old to join"}
          {step === 2 && "Select the gender you identify with"}
          {step === 3 && "This helps us show you relevant matches"}
          {step === 4 && "Write at least 10 characters"}
          {step === 5 && "Location is required for matching"}
          {step === 6 && "Select at least 3 interests"}
          {step === 7 && "Profile picture is required"}
          {step === 8 && "Upload at least 2 additional photos"}
        </div>
      </form>
    </div>
  );
};

export default CompleteProfile;