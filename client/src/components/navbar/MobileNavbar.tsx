import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Utensils, Menu, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { page } from ".";
import localStorageService from "@/utils_graphQL/localStorageService";

interface MobileNavbarProps {
  pages: page[];
  userStatus: string;
}

export default function MobileNavbar({ pages, userStatus }: MobileNavbarProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = userStatus !== "visiter";

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
    setOpen(false);
  };

  return (
    <nav
      id="mobile-navbar"
      className="fixed top-0 left-0 right-0 h-16 bg-[#ff9e40] border-b flex items-center justify-between px-4 z-50"
    >
      <Sheet open={open} onOpenChange={setOpen}>
        {/* sheet opener search bar */}
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className=" text-white" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80%] sm:w-[350px]">
          <div className="py-4">
            {/* navigation search bar */}
            <div className="mb-6 px-2 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for a Recipe"
                className="w-full pl-8"
                onKeyDown={searchListener}
              />
            </div>

            {/* navigation buttons */}
            <div className="space-y-1">
              {pages.map((page, index) => (
                <Button
                  key={index}
                  id={`nav-button-${page.name.toLowerCase().replace(" ", "-")}`}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(page.href);
                    setOpen(false);
                  }}
                >
                  {page.name}
                </Button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <Utensils className="h-5 w-5 text-white" />
        <span className="text-white text-2xl font-bold">Forkalicious</span>
      </div>

      {/* Account button */}
      <Link
        to="/account"
        id="account-nav-button"
        className="text-white flex items-center focus:outline-none"
      >
        <User className="mr-2" />
        {loggedIn ? "Account" : "Sign In"}
      </Link>
    </nav>
  );
}
