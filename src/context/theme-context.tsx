import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Matches --background in index.css for each theme; keeps the browser chrome on phones in step with the page.
const themeColor: Record<Theme, string> = { light: "#ffffff", dark: "#0f0f0f" };

// The site opens in light mode; only a theme the visitor picked with the toggle is remembered (see public/theme.js).
const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(getPreferredTheme);

  // Sync the chosen theme with the <html> element, the color-scheme and the theme-color meta.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = window.document.documentElement;
    root.classList.remove(theme === "dark" ? "light" : "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    window.document.querySelector<HTMLMetaElement>("meta[name='theme-color']")?.setAttribute("content", themeColor[theme]);
  }, [theme]);

  const setTheme = (value: Theme) => {
    window.localStorage.setItem("theme", value);
    setThemeState(value);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      window.localStorage.setItem("theme", next);
      return next;
    });
  };

  // Memoize the context value so consumers only re-render when the theme actually changes.
  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
