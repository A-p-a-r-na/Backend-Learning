import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Restrict theme to only these two values instead of a generic string
type Theme = "light" | "dark";

type ThemeProviderType = {
  children: ReactNode;
};

// Shape of the value exposed to consumers via useTheme()
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

// Default is null so we can detect "used outside provider" in useTheme()
const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: ThemeProviderType) {
  // Source of truth for the current theme, defaults to light
  const [theme, setTheme] = useState<Theme>("light");

  // Flips between light and dark based on the previous value
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Whenever theme changes, sync it onto the <html> element as a data attribute.
  // This is what lets the CSS [data-theme="..."] selectors pick up the change.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook so components don't need to import useContext + ThemeContext directly
export function useTheme() {
  const context = useContext(ThemeContext);

  // Guards against calling useTheme() outside of <ThemeProvider>,
  // e.g. forgetting to wrap the app in the provider
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
