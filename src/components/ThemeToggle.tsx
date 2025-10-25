import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";
import { MoonStar, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "ghost";
}

const ThemeToggle = ({ className, variant = "default" }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    // Shared button component used in nav + drawer to switch between light/dark schemes.
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className={cn(
        "relative flex items-center justify-center gap-2 rounded-full transition-colors text-sm font-medium",
        "border border-border/60 text-foreground/80 hover:text-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        variant === "default" && "px-4 py-2 bg-secondary/60 hover:bg-secondary",
        variant === "ghost" && "p-2 bg-secondary/50 hover:bg-secondary",
        className
      )}
    >
      {isDark ? <Sun size={16} /> : <MoonStar size={16} />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"} Mode</span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};

export default ThemeToggle;
