import { Link } from "react-router-dom";
import { ThemeSwithcer } from "../theme-switcher/inddex";

export default function Header() {
  return (
    <header>
      <nav className="h-[4rem] border-b px-container flex justify-between items-center">
        <ul className="flex gap-4 [&>*:hover]:text-primary [&>*]:transition-colors font-semibold">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
        <ThemeSwithcer />
      </nav>
    </header>
  );
}
