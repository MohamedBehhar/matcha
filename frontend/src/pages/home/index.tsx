import useCountStore from "@/store/store";

export default function HomePage() {
  const count = useCountStore((state) => state.count);
  return (
    <main className="grid place-content-center">
      <h1 className="text-6xl">Home Page</h1>
      {count}
    </main>
  );
}
