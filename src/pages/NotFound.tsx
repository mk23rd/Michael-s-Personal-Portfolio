import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { profile } from "@/data/portfolio";

const NotFound = () => {
  const pathname = window.location.pathname;

  useEffect(() => {
    console.warn(`404: no route matches ${pathname}`);
  }, [pathname]);

  return (
    <main className="flex min-h-screen flex-col">
      <header className="wrap flex items-center justify-between py-6">
        <a href="/" className="font-medium tracking-tight">
          {profile.name}
        </a>
        <ThemeToggle />
      </header>
      <div className="wrap flex flex-1 flex-col items-start justify-center pb-24">
        <p className="label">404</p>
        <h1 className="display h1 mt-4 max-w-[14ch]">There's nothing at this address.</h1>
        <p className="lede mt-6 max-w-[38rem]">
          <code className="rounded-md bg-secondary px-1.5 py-0.5 text-base">{pathname}</code> doesn't
          exist on this site. Everything lives on the front page.
        </p>
        <a href="/" className="pill pill-solid mt-9">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to the front page
        </a>
      </div>
    </main>
  );
};

export default NotFound;
