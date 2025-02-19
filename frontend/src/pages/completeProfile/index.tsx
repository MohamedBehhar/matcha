import { useState } from "react";
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

interface Step5Props {
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
    <AnimatedStep>
      <Button
        Button
        type="button"
        onClick={incrementStep}
        className="absolute right-4 bottom-4"
      >
        <FaAngleDoubleRight size={24} />
      </Button>
    </AnimatedStep>
  );
};

// Step 1: Select Birthdate
const Step1 = ({ birthDate, setBirthDate, incrementStep }: Step1Props) => {
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
      {birthDate && NextButton({ incrementStep })}
    </AnimatedStep>
  );
};

// Step 2: Select Gender
const Step2 = ({ user, setUserInfos, incrementStep }: StepProps) => (
  <AnimatedStep>
    <div className="w-full flex flex-col justify-center items-center gap-10">
      <h1 className="text-3xl font-bold text-grey-secondary">
        Select Your Gender
      </h1>
      <div className="flex justify-center gap-4">
        <Button
          className={`w-36 h-36 hover:scale-110 ease-linear flex flex-col gap-2 ${
            user.gender === "female" ? "border border-white" : ""
          }`}
          variant="ghost"
          onClick={() => setUserInfos({ ...user, gender: "female" })}
        >
          <FaFemale className="text-4xl text-red-primary" size={80} />
        </Button>
        <Button
          className={`w-36 h-36 hover:scale-110 ease-linear flex flex-col gap-2 ${
            user.gender === "male" ? "border border-white" : ""
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
      <h1 className="text-3xl font-bold" style={{ color: "#333" }}>
        Interested In
      </h1>
      <RadioGroup
        defaultValue={user.sexual_preference}
        onChange={(value) =>
          setUserInfos({ ...user, sexual_preference: value })
        }
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

// Step 4: Add Bio
const Step4 = ({ user, setUserInfos, incrementStep }: StepProps) => (
  <AnimatedStep>
    <div className="w-full flex flex-col justify-center items-center gap-10">
      <h1 className="text-3xl font-bold" style={{ color: "#333" }}>
        Add a Bio
      </h1>
      <Textarea
        name="bio"
        placeholder="Bio"
        defaultValue={user.bio}
        className="mb-4 w-[300px]"
        maxLength={500}
        rows={5}
        onChange={(e) => setUserInfos({ ...user, bio: e.target.value })}
      />
    </div>
  </AnimatedStep>
);

// Step 5: Upload Profile Picture
const Step5 = ({ profilePicture, setProfilePicture }: Step5Props) => {
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
        <h1 className="text-3xl font-bold mb-4">Add a profile picture</h1>
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

// Confirmation Step
const ConfirmationStep = ({
  user,
  birthDate,
  profilePicture,
}: {
  user: User;
  birthDate: string;
  profilePicture: File | null;
}) => (
  <AnimatedStep>
    <div className="w-full flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold">Confirm Your Details</h1>
      <div className="text-left">
        <p>
          <strong>Birthdate:</strong> {birthDate}
        </p>
        <p>
          <strong>Gender:</strong> {user.gender}
        </p>
        <p>
          <strong>Interested In:</strong> {user.sexual_preference}
        </p>
        <p>
          <strong>Bio:</strong> {user.bio}
        </p>
        {profilePicture && (
          <img
            src={URL.createObjectURL(profilePicture)}
            alt="profile"
            className="w-24 h-24 rounded-full mt-2"
          />
        )}
      </div>
    </div>
  </AnimatedStep>
);

// Progress Indicator
const ProgressIndicator = ({ step }: { step: number }) => (
  <div className="flex gap-2 mb-6">
    {[1, 2, 3, 4, 5].map((s) => (
      <div
        key={s}
        className={`w-4 h-4 rounded-full ${
          s <= step ? "bg-red-primary" : "bg-gray-300"
        }`}
      />
    ))}
  </div>
);

// Main Component
const CompleteProfile = () => {
  const { user, setUserInfos } = useUserStore();
  const [birthDate, setBirthDate] = useState("");
  const [step, setStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const incrementStep = () => setStep((prev) => prev + 1);
  const decrementStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("date_of_birth", birthDate);
    formData.append("gender", user.gender || "");
    formData.append("sexual_preference", user.sexual_preference || "");
    formData.append("bio", user.bio || "");
    if (profilePicture instanceof File) {
      formData.append("profilePicture", profilePicture);
    }

    try {
      const response = await updateUser(formData, user.id + "");
      if (response) {
        alert("Profile updated successfully.");
      }
    } catch (error) {
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div>
      <form
        className="container flex flex-col items-center pt-10 h-screen gap-6 relative border"
        onSubmit={handleSubmit}
      >
        {/* <ProgressIndicator step={step} /> */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <>
              <Step1
                birthDate={birthDate}
                setBirthDate={setBirthDate}
                incrementStep={incrementStep}
              />
              <Button
                type="button"
                onClick={incrementStep}
                className="absolute right-4 bottom-4"
              >
                <FaAngleDoubleRight size={24} />
              </Button>
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
              user={user}
              setUserInfos={setUserInfos}
              incrementStep={incrementStep}
            />
          )}
          {step === 5 && (
            <Step5
              profilePicture={profilePicture}
              setProfilePicture={setProfilePicture}
            />
          )}
          {/* {step === 6 && (
            <ConfirmationStep
              user={user}
              birthDate={birthDate}
              profilePicture={profilePicture}
            />
          )} */}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-4">
          {step > 1 && step < 6 && (
            <Button type="button" onClick={decrementStep}>
              Back
            </Button>
          )}
          {step < 5 ? (
            <Button type="button" onClick={incrementStep}>
              Next
            </Button>
          ) : step === 5 ? (
            <Button type="button" onClick={incrementStep}>
              Review
            </Button>
          ) : (
            <Button type="submit">Finish</Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CompleteProfile;
