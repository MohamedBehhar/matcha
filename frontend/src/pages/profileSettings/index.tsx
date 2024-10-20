import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MySelect from "@/components/ui/MySelect";
import TagInput from "@/components/ui/Tags";

function index() {
  return (
    <div className="container flex flex-col items-center justify-center h-screen ">
      <h1 className="text-3xl font-bold text-center my-5">Profile Setting</h1>
      <form action="w-[800px]  border debug"
        style={{ width: "800px",
          maxWidth: "100%",
         }}
      >
        <div className="  grid md:grid-cols-3 sm:grid-cols-2  gap-5 w-full mb-4">
          <Input
            type="text"
            name="first_name"
            placeholder="First Name"
          />
          <Input
            name="last_name"
            type="text"
            placeholder="Last Name"
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
          />
          <Input
            name="username"
            type="text"
            placeholder="Username"
          />
          <MySelect options={["male", "female"]} placeholder="Gender" />
          <MySelect
            options={["male", "female"]}
            placeholder="Sexual preferences"
          />
        </div>

        <Input id="picture" type="file" />
        <TagInput />
      </form>
    </div>
  );
}

export default index;
