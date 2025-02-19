import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MySelect from "@/components/ui/MySelect";
import useUserStore from "@/store/userStore";
import { Textarea } from "@/components/ui/textArea";
import { Button } from "@/components/ui/button";
import { FaMale } from "react-icons/fa";
import { FaFemale } from "react-icons/fa";
import { BsGenderFemale, BsX } from "react-icons/bs";
import { BsGenderMale } from "react-icons/bs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radioGroup";
import { Label } from "@/components/ui/label";
import { RiImageAddLine } from "react-icons/ri";
import { FaRegEdit } from "react-icons/fa";
import userImg from "@/assets/images/user.png";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

const Step1 = ({
  birthDate,
  setBirthDate,
  incrementStep,
}: {
  birthDate: string;
  setBirthDate: (value: string) => void;
  incrementStep: () => void;
}) => (
  <div>
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col justify-center items-center gap-10"
    >
      <h1 className="text-3xl font-bold text-grey-secondary">
        Select your birthdate
      </h1>
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
        className=" p-2 border rounded-md bg-transparent padding-2 w-[240px] mb-4"
        onChange={(e) => setBirthDate(e.target.value)}
      />
    </motion.div>
    {birthDate && (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 text-red-primary"
        onClick={incrementStep}
      >
        <FaAngleDoubleRight />
        next
      </motion.div>
    )}
  </div>
);

const Step2 = ({ user, setUserInfos, incrementStep }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
    className="w-full flex flex-col justify-center items-center gap-10"
  >
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
    {user.gender && (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 text-red-primary"
        onClick={incrementStep}
      >
        <FaAngleDoubleRight />
        next
      </motion.div>
    )}
  </motion.div>
);

const Step3 = ({ user, setUserInfos, incrementStep }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
    className="w-full flex flex-col justify-center items-center gap-10"
  >
    <h1 className="text-3xl font-bold" style={{ color: "#333" }}>
      Interested In
    </h1>
    <RadioGroup
      defaultValue={user.sexual_preference}
      onChange={(value) => setUserInfos({ ...user, sexual_preference: value })}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="heterosexual" id="r1" />
        <label htmlFor="r1">Heterosexual</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="bisexual" id="r2" />
        <label htmlFor="r2">Bisexual</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="homosexual" id="r3" />
        <label htmlFor="r3">Homosexual</label>
      </div>
    </RadioGroup>
    {
      user.sexual_preference && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 text-red-primary"
          onClick={incrementStep}
        >
          <FaAngleDoubleRight />
          next
        </motion.button>
      )
    }
  </motion.div>
);

const Step4 = ({ user, setUserInfos, incrementStep }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className="w-full"
  >
    <Textarea
      name="bio"
      placeholder="Bio"
      defaultValue={user.bio}
      className="mb-4"
      maxLength={500}
      rows={5}
      onChange={(e) => setUserInfos({ ...user, bio: e.target.value })}
    />
  </motion.div>
);

const Step5 = ({
  profilePicture,
  setProfilePicture,
}: {
  profilePicture: File | null;
  setProfilePicture: (value: File | null) => void;
}) => {
  const handelProfilePicture = (e: any) => {
    setProfilePicture(e.target.files[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="w-full flex justify-center items-center flex-col gap-4"
    >
      <h1 className="text-3xl font-bold mb-4">Add a profile picture</h1>
      <div className="flex items-center justify-center  mb-2 rounded-full w-[200px]">
        {profilePicture ? (
          <div className="relative">
            <img
              src={
                profilePicture instanceof File
                  ? URL.createObjectURL(profilePicture)
                  : ``
              }
              alt="profile"
              className="flex-1 w-[200px] aspect-square object-cover rounded-full"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = userImg;
              }}
            />
            <label className="absolute top-0 right-0  rounded-full p-1">
              <FaRegEdit size={20} />

              <input
                type="file"
                accept="image/*"
                onChange={handelProfilePicture}
                className="hidden"
              />
            </label>
            {/* <button
              className="absolute top-0 right-0  rounded-full p-1"
              onClick={() => setProfilePicture(null)}
            >
              <FaRegEdit size={20} />
            </button> */}
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center aspect-square rounded-full  p-1 w-full">
            <RiImageAddLine size={60} className="text-gray-600" />
            <input
              type="file"
              accept="image/*"
              onChange={handelProfilePicture}
              className="hidden"
            />
          </label>
        )}
      </div>
    </motion.div>
  );
};

const CompleteProfile = () => {
  const { user, setUserInfos } = useUserStore();
  const [birthDate, setBirthDate] = useState("");
  const [step, setStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const incrementStep = () => setStep((prev) => prev + 1);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("date_of_birth", birthDate);
    formData.append("gender", user.gender || "");
    formData.append("sexual_preference", user.sexual_preference || "");
    formData.append("bio", user.bio || "");
    if (profilePicture instanceof File) {
      formData.append("profilePicture", profilePicture);
    }
    console.log("formData", formData);
  };

  return (
    <div>
      <form
        className="container flex flex-col items-center justify-center h-screen gap-6 relative border"
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        {step}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              incrementStep={incrementStep}
            />
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
              setProfilePicture={setProfilePicture}
              profilePicture={profilePicture}
            />
          )}
        </AnimatePresence>

        {/* Navigation Buttons
        <div className="flex gap-4 mt-4">
          {step > 1 && (
            <Button onClick={() => setStep((prev) => prev - 1)}>Back</Button>
          )}
          {step < 5 ? (
            <Button onClick={() => setStep((prev) => prev + 1)}>Next</Button>
          ) : (
            <Button type="submit">Finish</Button>
          )}
        </div> */}
      </form>
    </div>
  );
};

export default CompleteProfile;
