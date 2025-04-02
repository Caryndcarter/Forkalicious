import { useContext } from "react";
import { userContext } from "@/App";
import "./mediaQuery.css";
import "./DesktopNavbar";
import "./MobileNavbar";
import MobileNavbar from "./MobileNavbar";
import DesktopNavbar from "./DesktopNavbar";

export interface page {
  name: string;
  href: string;
  icon: string;
}

// the search page is a special case and isn't included here
const pages: page[] = [
  {
    name: "Home",
    href: "/",
    icon: "home",
  },
  {
    name: "Recipe Book",
    href: "/recipe-book",
    icon: "bookOpen",
  },
  {
    name: "Recipe Maker",
    href: "/recipe-maker",
    icon: "bookPlus",
  },
];

export default function Navbar() {
  const { userStatus } = useContext(userContext);

  return (
    <>
      <MobileNavbar pages={pages} userStatus={userStatus} />
      <DesktopNavbar pages={pages} userStatus={userStatus} />
    </>
  );
}
