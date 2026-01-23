import { createContext, useContext, useEffect, useState } from "react";

// Define the type for your theme
export type Theme = "cupcake" | "dim"; // can extend later like "coffee" | "cupcake"

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to get initial theme
const getInitialTheme = (): Theme => {
  // 1️⃣ Check localStorage
  const savedTheme = localStorage.getItem("theme") as Theme | null;
  if (savedTheme === "cupcake" || savedTheme === "dim") return savedTheme;

  // 2️⃣ Check system preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) return "dim";

  // 3️⃣ Default fallback
  return "cupcake";
};

// Provider component
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Sync DOM and localStorage when theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle function
  const toggleTheme = () => {
    setTheme((prev) => (prev === "cupcake" ? "dim" : "cupcake"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme anywhere
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
