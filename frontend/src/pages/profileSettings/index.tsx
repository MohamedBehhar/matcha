import React from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {SelectDemo} from "@/components/ui/select";

function index() {
  return (
    <div
		className="container flex flex-col items-center justify-center h-screen "
	>
      <h1 className="text-3xl font-bold text-center my-5">Profile Setting</h1>
      <div className="max-w-[800px]">
        <form action="" className="grid grid-cols-3 gap-5">
          <Input
            type="text"
            name="first_name"
            placeholder="First Name"
            className="mb-4"
          />
          <Input
            name="last_name"
            type="text"
            placeholder="Last Name"
            className="mb-4"
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            className="mb-4"
          />
          <Input
            name="username"
            type="text"
            placeholder="Username"
            className="mb-4"
          />
		  <SelectDemo
			options={[ "Option 1", "Option 2", "Option 3" ]}
			selectLabel="Select Label"
			placeHolder="Select Option"
		  />

        </form>
      </div>
    </div>
  );
}

export default index;
