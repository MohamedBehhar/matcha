import { FaHeartbeat } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { IoChatbubbleSharp } from "react-icons/io5";

export const headerData = [
  {
    title: "profile",
    path: "/profile-settings",
    typeImg: "img",
    icon: <FaUserCircle size={28} />,
  },
  {
    title: "Match Making",
    path: "/match-making",
    typeImg: "icon",
    icon: <FaHeartbeat size={28} />,
  },
  {
    title: "Notifications",
    path: "/notifications",
    typeImg: "icon",
    icon: <IoMdNotifications size={28} />,
  },
  {
    title: "Messages",
    path: "/messages",
    typeImg: "icon",
    icon: <IoChatbubbleSharp size={28} />,
  },
];
