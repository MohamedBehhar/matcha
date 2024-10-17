import useUserStore from "@/store/userStore";

export default function HomePage() {
  const user = useUserStore((state:any) => state.user);
  return (
    <main className="grid place-content-center">
      <h1 className="text-6xl">Home Page</h1>
      <h2 className="text-2xl">Welcome {user.first_name} {user.last_name}</h2>
      {user.is_authenticated ? (
        <p>You are logged in</p>
      ) : (
        <p>You are not logged in</p>
      )}
      {user.email}
    </main>
  );
}
