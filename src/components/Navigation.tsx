
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

/**
 * Top navigation bar for the portfolio site.
 * - Handles responsive behavior (desktop links vs mobile drawer)
 * - Exposes a theme toggle that is always accessible
 * - Adds a small elevation when the user scrolls past the hero
 */
const Navigation = () => {
  // Track whether the mobile drawer is open for responsive layouts.
  const [isOpen, setIsOpen] = useState(false);
  // Adds a subtle shadow/background once the user scrolls past the hero.
  const [scrolled, setScrolled] = useState(false);

  // Centralized definition of anchor links keeps desktop/mobile navigation in sync.
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Projects", href: "#projects" },
    { name: "Skills", href: "#skills" },
    { name: "Education", href: "#education" },
    { name: "Contact", href: "#contact" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "py-3 bg-background/80 backdrop-blur-md shadow-sm"
          : "py-6 bg-transparent"
      )}
    >
      <div className="section-container flex items-center justify-between">
        <a href="#home" className="text-xl font-semibold">
          <span className="text-gradient">Michael's Portfolio</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="nav-link text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {link.name}
            </a>
          ))}
          {/* Provide an always-visible theme toggle on larger screens. */}
          <ThemeToggle variant="ghost" />
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {/* Theme toggle stays accessible even when the menu is closed. */}
          <ThemeToggle variant="ghost" />
          <button
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={cn(
        "fixed inset-0 z-40 bg-background md:hidden transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex h-full flex-col gap-2 overflow-y-auto overscroll-contain p-8 pt-24 pb-16">
          {navLinks.map((link, index) => (
            <a
              key={link.name}
              href={link.href}
              className={cn(
                "py-4 text-lg font-medium border-b border-border/10 text-foreground/80 hover:text-foreground transition-colors",
                "animate-fade-in opacity-0",
                `reveal-delay-${index + 1}`
              )}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="mt-auto pt-8">
            {/* Full-width toggle offers the same UX parity inside the drawer. */}
            <ThemeToggle className="w-full justify-center" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
