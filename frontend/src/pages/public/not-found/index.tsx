import NotfoundImage from "@/assets/images/not-found.svg?react";
import { Button } from "@/components/ui/button";

export default function NotfoundPage() {
  return (
    <main className="h-screen w-screen flex justify-center items-center  flex-col gap-4">
      <NotfoundImage className="w-1/2 h-[40%] fill-primary" />
      <h1 className="text-[clamp(1.5rem,5vw,4rem)] capitalize">
        page not found
      </h1>
      <p className="text-[clamp(1rem,3vw,2rem)] text-gray-500 text-center">
        The page you are looking for does not exist.
      </p>
      <Button className="bg-red-primary text-white hover:bg-red-primary/80">
        <a href="/">Go to Home</a>
      </Button>
    </main>
  );
}
