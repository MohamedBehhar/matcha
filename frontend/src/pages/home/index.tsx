import useCountStore from "@/store/store";
import { getUser } from "@/api/methods/user";
import { useEffect } from "react";
export default function HomePage() {
  useEffect(() => {
    getUser().then((data) => console.log(data));
  }, []);
  const count = useCountStore((state) => state.count);
  return (
    <main className="grid place-content-center">
      <h1 className="text-6xl">Home Page</h1>
      {count}
    </main>
  );
}
