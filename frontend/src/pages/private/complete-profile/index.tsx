import { useState } from "react";
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
import { updateUser } from "@/api/methods/user";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

// Types
interface User {
  gender: string;
  sexual_preference: string;
  bio: string;
}

// Steps Constants
const TOTAL_STEPS = 5;

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
  <div className="flex gap-8 mb-6  justify-center items-center ">
    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
      <div
        key={i}
        className={`w-4 h-4 rounded-full ${
          i + 1 <= step ? "bg-red-primary" : "bg-gray-300"
        }`}
      />
    ))}
    <h1>{step.title}</h1>
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
    className="flex items-center gap-2"
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
      <input
        type="date"
        value={birthDate}
        max={
          new Date(new Date().setFullYear(new Date().getFullYear() - 18))
            .toISOString()
            .split("T")[0]
        }
        onChange={(e) => setBirthDate(e.target.value)}
        className="p-2 border rounded-md bg-transparent w-60"
      />
    </div>
  </AnimatedStep>
);

// Step 2: Gender
const Step2 = ({
  user,
  setUserInfos,
}: {
  user: User;
  setUserInfos: (u: User) => void;
}) => (
  <AnimatedStep>
    <div className="flex justify-center gap-4">
      <Button
        variant="ghost"
        className={`w-36 h-36 flex flex-col items-center justify-center ${
          user.gender === "female" ? "border border-white" : ""
        }`}
        onClick={() => setUserInfos({ ...user, gender: "female" })}
        type="button"
      >
        <FaFemale size={80} className="text-red-primary" />
        Female
      </Button>
      <Button
        variant="ghost"
        className={`w-36 h-36 flex flex-col items-center justify-center ${
          user.gender === "male" ? "border border-white" : ""
        }`}
        onClick={() => setUserInfos({ ...user, gender: "male" })}
        type="button"
      >
        <FaMale size={80} className="text-blue-primary" />
        Male
      </Button>
    </div>
  </AnimatedStep>
);

// Step 3: Sexual Preference
const Step3 = ({
  user,
  setUserInfos,
}: {
  user: User;
  setUserInfos: (u: User) => void;
}) => (
  <AnimatedStep>
    <RadioGroup
      value={user.sexual_preference}
      onValueChange={(value) =>
        setUserInfos({ ...user, sexual_preference: value })
      }
      className="flex flex-col gap-4"
    >
      {["heterosexual", "bisexual", "homosexual"].map((pref) => (
        <div key={pref} className="flex items-center space-x-2">
          <RadioGroupItem value={pref} id={pref} />
          <Label htmlFor={pref} className="capitalize">
            {pref}
          </Label>
        </div>
      ))}
    </RadioGroup>
  </AnimatedStep>
);

// Step 4: Bio
const Step4 = ({
  user,
  setUserInfos,
}: {
  user: User;
  setUserInfos: (u: User) => void;
}) => (
  <AnimatedStep>
    <div className="flex flex-col items-center gap-4">
      <Textarea
        placeholder="Tell us about yourself..."
        value={user.bio}
        onChange={(e) => setUserInfos({ ...user, bio: e.target.value })}
        maxLength={500}
        rows={5}
        className="w-72"
      />
    </div>
  </AnimatedStep>
);

// Step 5: Profile Picture
const Step5 = ({
  profilePicture,
  setProfilePicture,
}: {
  profilePicture: File | null;
  setProfilePicture: (f: File | null) => void;
}) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("File too large (max 5MB)");
    if (!file.type.startsWith("image/")) return alert("Upload an image file");
    setProfilePicture(file);
  };

  return (
    <AnimatedStep>
      <div className="flex flex-col items-center gap-4">
        {profilePicture ? (
          <div className="relative">
            <img
              src={URL.createObjectURL(profilePicture)}
              alt="profile"
              className="w-52 h-52 object-cover rounded-full"
            />
            <button
              className="absolute top-0 right-0 bg-white rounded-full p-1"
              onClick={() => setProfilePicture(null)}
            >
              <BsX size={20} />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-full w-52 h-52">
            <RiImageAddLine size={60} />
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        )}
      </div>
    </AnimatedStep>
  );
};

// Main Component
const CompleteProfile = () => {
  const { user, setUserInfos } = useUserStore();
  const [birthDate, setBirthDate] = useState("");
  const [step, setStep] = useState(1);
  const stepTitles = [
    "Add your birthdate",
    "Select your gender",
    "Select your sexual preference",
    "Write a short bio",
    "Upload a profile picture",
  ];
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((prev) => prev + 1);
  };

  const isNextDisabled = () => {
    switch (step) {
      case 1:
        return !birthDate;
      case 2:
        return !user.gender;
      case 3:
        return !user.sexual_preference;
      case 4:
        return !user.bio?.trim();
      default:
        return false;
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("date_of_birth", birthDate);
    formData.append("gender", user.gender || "");
    formData.append("sexual_preference", user.sexual_preference || "");
    formData.append("bio", user.bio || "");
    if (profilePicture instanceof File) {
      formData.append("profile_picture", profilePicture);
    }

    console.log(formData);

    try {
      const response = await updateUser(formData, user.id + "");
      if (response) {
        toast.success("Profile updated successfully!");
        navigate("/match-making");
      }
    } catch (error) {
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center h-[100vh] gap-6"
    >
      <ProgressIndicator step={step} />
      <h1 className="text-2xl font-bold text-center">{stepTitles[step - 1]}</h1>

      {step === 1 && (
        <Step1 birthDate={birthDate} setBirthDate={setBirthDate} />
      )}
      {step === 2 && <Step2 user={user} setUserInfos={setUserInfos} />}
      {step === 3 && <Step3 user={user} setUserInfos={setUserInfos} />}
      {step === 4 && <Step4 user={user} setUserInfos={setUserInfos} />}
      {step === 5 && (
        <Step5
          profilePicture={profilePicture}
          setProfilePicture={setProfilePicture}
        />
      )}

      <div className="mt-4 flex gap-4">
        {step > 1 && (
          <Button onClick={handlePrevious} type="button" variant="outline">
            Previous
          </Button>
        )}

        {step < TOTAL_STEPS ? (
          <NextButton onClick={handleNext} disabled={isNextDisabled()} />
        ) : (
          <Button type="submit" disabled={isNextDisabled()}>
            Finish
          </Button>
        )}
      </div>
    </form>
  );
};

export default CompleteProfile;
