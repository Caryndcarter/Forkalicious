import { useNavigate } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import localStorageService from "@/utils_graphQL/localStorageService";
// import { Input } from "@/components/ui/input";
import {
  Home,
  ArrowLeft,
  BookOpen,
  Utensils,
  Search,
  Settings,
  BookPlus,
  CircleOff,
  UserCog,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { page } from ".";

interface DesktopNavbarProps {
  pages: page[];
  userStatus: string;
}

export default function DesktopNavbar({
  pages,
  userStatus,
}: DesktopNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const loggedIn = userStatus !== "visiter";

  const handleBack = () => {
    navigate(-1);
  };

  const searchListener = (event: any) => {
    // this will only trigger when hitting "enter"
    if (event.key !== "Enter") {
      return;
    }
    const inputValue = (event.target as HTMLInputElement).value;
    localStorageService.setQuery(inputValue);

    // if already on the search page, reload
    if (location.pathname === "/search") {
      window.location.reload();
    } else {
      navigate("/search");
    }
  };

  // Map page names to appropriate icons
  const getIconForPage = (pageName: string) => {
    switch (pageName) {
      case "home":
        return <Home className="w-5 h-5" />;
      case "recipes":
        return <Utensils className="w-5 h-5" />;
      case "bookOpen":
        return <BookOpen className="w-5 h-5" />;
      case "search":
        return <Search className="w-5 h-5" />;
      case "settings":
        return <Settings className="w-5 h-5" />;
      case "bookPlus":
        return <BookPlus className="w-5 h-5" />;
      case "userCog":
        return <UserCog className="w-5 h-5" />;
      default:
        return <CircleOff className="w-5 h-5" />;
    }
  };

  return (
    <>
      <nav
        id="desktop-navbar"
        className="fixed top-0 left-0 right-0 bg-[#ff9e40] p-4 shadow-md z-10 mx-auto flex flex-col"
      >
        <div id="title-row" className="text-center mb-4 flex justify-center">
          <Link to="/" className="flex items-center">
            <Utensils className="h-8 w-8 text-white mr-4" />
            <h1 className="text-white text-3xl font-bold">Forkalicious</h1>
          </Link>
        </div>

        <div
          id="icon-row"
          className="flex justify-center items-center w-full mb-2"
        >
          <Button
            id="back-button"
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-white/20 flex flex-col items-center mx-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-xs mt-1">Go back</span>
          </Button>

          {location.pathname === "/search" ? (
            <Link
              key="/search"
              to="/search"
              id="nav-search-link"
              className={`text-white p-2 rounded-md hover:bg-white/20 flex flex-col items-center mx-4 ${
                location.pathname === "/search" ? "bg-white/20" : ""
              }`}
              title="Search Page"
            >
              <Search />
              <span className="text-xs mt-1">Search Page</span>
            </Link>
          ) : (
            <input
              id="search-bar"
              type="search"
              placeholder="Search for a Recipe"
              className="pl-8 rounded-md mx-4"
              onKeyDown={searchListener}
            />
          )}

          {/* row of page links/icons */}
          {pages.map((page) => (
            <Link
              key={page.href}
              to={page.href}
              id={`nav-${page.href.replace("/", "")}-link`}
              className={`text-white p-2 rounded-md hover:bg-white/20 flex flex-col items-center mx-4 ${
                location.pathname === page.href ? "bg-white/20" : ""
              }`}
              title={page.name}
            >
              {getIconForPage(page.icon)}
              <span className="text-xs mt-1">{page.name}</span>
            </Link>
          ))}

          <Link
            key="/account"
            to="/account"
            id="nav-account-link"
            className={`text-white p-2 rounded-md hover:bg-white/20 flex flex-col items-center mx-4 ${
              location.pathname === "/account" ? "bg-white/20" : ""
            }`}
            title="Account Settings"
          >
            <User className="w-5 h-5" />

            <span className="text-xs mt-1">
              {loggedIn ? "Account Settings" : "Log in"}
            </span>
          </Link>
        </div>
      </nav>
      <div id="desktop-spacer" className="h-20"></div>
    </>
  );
}