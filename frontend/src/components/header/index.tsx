import { Link } from "react-router-dom";
import { ThemeSwithcer } from "../theme-switcher/inddex";
import { Button } from "../ui/button";
import useUserStore from "@/store/userStore";

export default function Header() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  return (
    <header>
      <nav className="h-[4rem] border-b px-container flex justify-between items-center">
        <ul className="flex gap-4 [&>*:hover]:text-primary [&>*]:transition-colors font-semibold">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/profile-settings">
              Settings
            </Link>
          </li>
        </ul>
        <ThemeSwithcer />
        <Button className="bg-red-primary text-white"
          onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            logout();
            window.location.href = "/signin";
          }}
        >Logout</Button>
      </nav>
    </header>
  );
}