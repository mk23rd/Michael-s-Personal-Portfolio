import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { profile } from "@/data/portfolio";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn(`404: no route matches ${location.pathname}`);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen flex-col">
      <header className="wrap flex items-center justify-between py-6">
        <Link to="/" className="font-medium tracking-tight">
          {profile.name}
        </Link>
        <ThemeToggle />
      </header>
      <div className="wrap flex flex-1 flex-col items-start justify-center pb-24">
        <p className="label">404</p>
        <h1 className="display h1 mt-4 max-w-[14ch]">There's nothing at this address.</h1>
        <p className="lede mt-6 max-w-[38rem]">
          <code className="rounded-md bg-secondary px-1.5 py-0.5 text-base">{location.pathname}</code> doesn't
          exist on this site. Everything lives on the front page.
        </p>
        <Link to="/" className="pill pill-solid mt-9">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to the front page
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
