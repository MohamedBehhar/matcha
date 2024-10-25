import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MySelect from "@/components/ui/MySelect";
import { getInterests } from "@/api/methods/interest";

function index() {
  const [interests, setInterests] = React.useState([]);
  React.useEffect(() => {
    getInterests()
      .then((data) => {
        console.log(data[0]);
        setInterests(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const [selectedInterests, setSelectedInterests] = React.useState([]);

  const selectInterest = (name: string) => {
    if (selectedInterests.includes(name)) {
      setSelectedInterests(
        selectedInterests.filter((interest) => interest !== name)
      );
    } else {
      setSelectedInterests([...selectedInterests, name]);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center h-screen ">
      <h1 className="text-3xl font-bold text-center my-5">Profile Setting</h1>
      <div className="flex items-center justify-center w-full p-4  rounded-md">
        <img
          src="https://randomuser.me/api/portraits/men/75.jpg"
          alt="profile"
          className="flex-1 max-w-[200px] rounded-full "

        />
      </div>
      <form
        action="w-[800px]  border debug"
        style={{ width: "800px", maxWidth: "100%" }}
      >
        <div className="  grid md:grid-cols-3 sm:grid-cols-2  gap-5 w-full mb-4">
          <Input type="text" name="first_name" placeholder="First Name" />
          <Input name="last_name" type="text" placeholder="Last Name" />
          <Input name="email" type="email" placeholder="Email" />
          <Input name="username" type="text" placeholder="Username" />
          <MySelect options={["male", "female"]} placeholder="Gender" />
          <MySelect
            options={["male", "female"]}
            placeholder="Sexual preferences"
          />
        </div>

        <Input id="picture" type="file" className="mb-4" />
        <div>
          <h2 className="text-xl font-bold">Select your interests</h2>
          <div className="flex gap-2 items-center ">
            <h2 className="text-xl font-bold">Interests</h2>
            {selectedInterests.length > 0 &&
              selectedInterests.map((interest) => (
                <Button
                  key={interest.id}
                  type="button"
                  className="bg-gray-200 p-1 m-1"
                >
                  #{interest}
                </Button>
              ))}
          </div>
          {interests.length > 0 &&
            interests.map((interest) => (
              <Button
                key={interest.id}
                type="button"
                className="bg-gray-200 m-1"
                onClick={selectInterest(interest.name)}
                size="sm"
              >
                #{interest.name}
              </Button>
            ))}
        </div>
      </form>
    </div>
  );
}

export default index;
