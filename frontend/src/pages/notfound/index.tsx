import NotfoundImage from "@/assets/images/not-found.svg?react";

export default function NotfoundPage() {
  return (
    <main className="h-screen w-screen flex justify-center items-center  flex-col gap-4">
      <NotfoundImage className="w-1/2 h-1/2 fill-primary" />
      <h1 className="text-[clamp(2rem,5vw,5rem)] capitalize">page not found</h1>
      <p className="text-[clamp(1.5rem,3vw,3rem)] text-gray-500 text-center">
        The page you are looking for does not exist.
      </p>
    </main>
  );
}
