import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMale,
  FaFemale,
  FaAngleDoubleRight,
  FaRegEdit,
} from "react-icons/fa";
import { BsX } from "react-icons/bs";
import { RiImageAddLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radioGroup";
import { Label } from "@/components/ui/label";
import useUserStore from "@/store/userStore";
import userImg from "@/assets/images/user.png";
import { updateUser } from "@/api/methods/user";
import { FiChevronsLeft } from "react-icons/fi";
import { FiChevronsRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { Navigate } from "react-router";
import { useNavigate } from "react-router-dom";
import { useLoadingStore } from "@/store/loadingStore";
import { is } from "date-fns/locale";
import HeartLoader from "@/components/HeartLoader";
import { Calendar } from "@/components/ui/calendar";

// Define TypeScript interfaces
interface User {
  gender: string;
  sexual_preference: string;
  bio: string;
}

interface StepProps {
  user: User;
  setUserInfos: (user: User) => void;
  incrementStep: () => void;
  decrementStep?: () => void;
}

interface Step1Props {
  birthDate: string;
  setBirthDate: (value: string) => void;
  incrementStep: () => void;
}

interface Step4Props {
  profilePicture: File | null;
  setProfilePicture: (value: File | null) => void;
}

// Reusable AnimatedStep component
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

const NextButton = ({ incrementStep }: { incrementStep: () => void }) => {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      onClick={incrementStep}
      className="justify-self-end"
    >
      <FiChevronsRight size={24} />
    </motion.button>
  );
};

// Step 1: Select Birthdate
const Step1 = ({ birthDate, setBirthDate, incrementStep }: Step1Props) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <AnimatedStep>
      <div className="w-full flex flex-col justify-center items-center gap-10">
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
          className="p-2 border rounded-md bg-transparent padding-2 w-[240px] mb-4"
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>

      {/* <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border shadow"
      /> */}
    </AnimatedStep>
  );
};

// Step 2: Select Gender
const Step2 = ({ user, setUserInfos, incrementStep }: StepProps) => (
  <AnimatedStep>
    <div className="w-full flex flex-col justify-center items-center gap-10">
      <div className="flex justify-center gap-4">
        <Button
          className={`w-36 h-36 hover:scale-110 ease-linear flex flex-col gap-2 ${
            user?.gender === "female" ? "border border-white" : ""
          }`}
          variant="ghost"
          onClick={() => setUserInfos({ ...user, gender: "female" })}
        >
          <FaFemale className="text-4xl text-red-primary" size={80} />
        </Button>
        <Button
          className={`w-36 h-36 hover:scale-110 ease-linear flex flex-col gap-2 ${
            user?.gender === "male" ? "border border-white" : ""
          }`}
          variant="ghost"
          onClick={() => setUserInfos({ ...user, gender: "male" })}
        >
          <FaMale className="text-4xl text-blue-primary" size={80} />
        </Button>
      </div>
    </div>
  </AnimatedStep>
);

// Step 3: Select Sexual Preference
const Step3 = ({ user, setUserInfos, incrementStep }: StepProps) => (
  <AnimatedStep>
    <div className="w-full flex flex-col justify-center items-center gap-10">
      <RadioGroup
        defaultValue={user?.sexual_preference}
        onChange={(e: any) => console.log(e.target.value)}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="heterosexual" id="r1" />
          <Label htmlFor="r1">Heterosexual</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bisexual" id="r2" />
          <Label htmlFor="r2">Bisexual</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="homosexual" id="r3" />
          <Label htmlFor="r3">Homosexual</Label>
        </div>
      </RadioGroup>
    </div>
  </AnimatedStep>
);

// Step 5: Upload Profile Picture
const Step4 = ({ profilePicture, setProfilePicture }: Step4Props) => {
  const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }
      setProfilePicture(file);
    }
  };

  return (
    <AnimatedStep>
      <div className="w-full flex justify-center items-center flex-col gap-4">
        <div className="flex items-center justify-center mb-2 rounded-full w-[200px]">
          {profilePicture ? (
            <div className="relative">
              <img
                src={URL.createObjectURL(profilePicture)}
                alt="profile"
                className="flex-1 w-[200px] aspect-square object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = userImg;
                }}
              />
              <button
                className="absolute top-0 right-0 rounded-full p-1 bg-white"
                onClick={() => setProfilePicture(null)}
              >
                <BsX size={20} />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center aspect-square rounded-full p-1 w-full">
              <RiImageAddLine size={60} className="text-gray-600" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicture}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </AnimatedStep>
  );
};

// Main Component
const CompleteProfile = () => {
  const { user, setUserInfos, fetchUserData } = useUserStore();
  const { isLoading } = useLoadingStore();
  const [birthDate, setBirthDate] = useState("");
  const [step, setStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const incrementStep = () => setStep((prev) => prev + 1);
  const decrementStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("date_of_birth", birthDate);
    formData.append("gender", user?.gender || "");
    formData.append("sexual_preference", user?.sexual_preference || "");
    if (profilePicture instanceof File) {
      formData.append("profile_picture", profilePicture);
    }

    console.log(formData);
    console.log(user?.id);
    if (!user?.id) return;

    try {
      const response = await updateUser(formData, user?.id + "");
      if (response) {
        toast.success("Profile updated successfully.");
        if (response.is_data_complete) {
          navigate("/profile-settings");
        }
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
  };
  const stepTitle = [
    "Select your birthdate",
    "Indicate your gender",
    "Select your sexual preference",
    "Upload a profile picture",
  ];

  return (
    <>
      {isLoading ? (
        <HeartLoader />
      ) : (
        <div className="flex items-center justify-center flex-col w-full h-screen ">
          <div className="flex  items-center justify-center gap-6 w-full max-w-[500px] ">
            {step > 1 && (
              <motion.button
                type="button"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onClick={decrementStep}
                className="justify-self-start"
              >
                <FiChevronsLeft size={24} />
              </motion.button>
            )}
            <form
              className=" flex flex-col items-center pt-10  gap-6 relative  min-w-[400px]"
              onSubmit={handleSubmit}
            >
              <h1 className="text-3xl text-center font-bold text-gray-400">
                {stepTitle[step - 1]}
              </h1>
              <div className="h-[200px] w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <>
                      <Step1
                        birthDate={birthDate}
                        setBirthDate={setBirthDate}
                        incrementStep={incrementStep}
                      />
                    </>
                  )}
                  {step === 2 && (
                    <Step2
                      user={user}
                      setUserInfos={setUserInfos}
                      incrementStep={incrementStep}
                    />
                  )}
                  {step === 3 && (
                    <Step3
                      user={user}
                      setUserInfos={setUserInfos}
                      incrementStep={incrementStep}
                    />
                  )}
                  {step === 4 && (
                    <Step4
                      profilePicture={profilePicture}
                      setProfilePicture={setProfilePicture}
                    />
                  )}
                </AnimatePresence>
              </div>
              {profilePicture && step >= 4 && (
                <Button type="submit" className="items">
                  Submit
                </Button>
              )}
            </form>
            {step < 5 && <NextButton incrementStep={incrementStep} />}
          </div>
        </div>
      )}
    </>
  );
};

export default CompleteProfile;
