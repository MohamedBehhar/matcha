import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MySelect from "@/components/ui/MySelect";
import useUserStore from "@/store/userStore";
import { Textarea } from "@/components/ui/textArea";
import { Button } from "@/components/ui/button";
import { FaMale } from "react-icons/fa";
import { FaFemale } from "react-icons/fa";
import { BsGenderFemale } from "react-icons/bs";
import { BsGenderMale } from "react-icons/bs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radioGroup";
import { Label } from "@/components/ui/label";

const Step1 = ({
  birthDate,
  setBirthDate,
}: {
  birthDate: string;
  setBirthDate: (value: string) => void;
}) => (
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
);

const Step2 = ({ user, setUserInfos }) => (
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
  </motion.div>
);

const Step3 = ({ user, setUserInfos }) => (
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
    <RadioGroup defaultValue="heterosexual">
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
  </motion.div>
);

const Step4 = ({ user, setUserInfos }) => (
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

const Step5 = ({ setUserInfos, user }) => {
  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      if (files.length + images.length <= 5) {
        setImages((prevImages) => [...prevImages, ...files]);
      }
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <h1 className="text-3xl font-bold mb-4">Upload Pictures</h1>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="mb-4"
      />
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={URL.createObjectURL(image)}
              alt={`Uploaded ${index}`}
              className="w-full h-32 object-cover rounded-md"
            />
            <button
              onClick={() => handleImageRemove(index)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const CompleteProfile = () => {
  const { user, setUserInfos } = useUserStore();
  const [birthDate, setBirthDate] = useState("");
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    console.log("Profile complete:", user);
    // You can handle submitting the user data to an API here
  };

  return (
    <div className="container flex flex-col items-center justify-center h-screen gap-6">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <Step1 birthDate={birthDate} setBirthDate={setBirthDate} />
        )}
        {step === 2 && <Step2 user={user} setUserInfos={setUserInfos} />}
        {step === 3 && <Step3 user={user} />}
        {step === 4 && <Step4 user={user} />}
        {step === 5 && <Step5 setUserInfos={setUserInfos} user={user} />}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-4">
        {step > 1 && (
          <Button onClick={() => setStep((prev) => prev - 1)}>Back</Button>
        )}
        {step < 5 ? (
          <Button onClick={() => setStep((prev) => prev + 1)}>Next</Button>
        ) : (
          <Button onClick={handleSubmit}>Finish</Button>
        )}
      </div>
    </div>
  );
};

export default CompleteProfile;
