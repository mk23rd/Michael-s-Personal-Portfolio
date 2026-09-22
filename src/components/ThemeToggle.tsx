import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/theme-context";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <span className="theme-icon" aria-hidden="true">
        <Sun size={18} className="theme-sun" />
        <Moon size={18} className="theme-moon" />
      </span>
    </button>
  );
};

export default ThemeToggle;
