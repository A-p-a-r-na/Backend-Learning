import { useTheme } from "../context/ThemeContext";

const ThemeSwitcher = () => {
  // Pull current theme value and the toggle function from context.
  // This component doesn't hold any theme state itself — it just consumes it.
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="themeSwitcher">
      <h1>React Context API Light and Dark Mode</h1>

      {/* Clicking calls toggleTheme() from context, which flips light <-> dark */}
      <button className="themeBtn" onClick={toggleTheme}>
        {/* Button label shows the theme you'll switch TO, not the current one */}
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>

      <h2>Welcome to the App</h2>
      {/* Displays whatever the current theme value is, straight from context */}
      <p>Current Theme: {theme}</p>
    </div>
  );
};

export default ThemeSwitcher;
