# React Context API - Light & Dark Mode
A minimal example of implementing a light/dark theme switcher in React using the **Context API**, TypeScript, and CSS custom properties (variables). No external state library or CSS-in-JS needed.

## Overview

This implementation uses:

-   React Context API to share the theme across the application.
-   A custom hook (`useTheme`) to access the context.
-   `useEffect` to synchronize the current theme with the `<html>`
    element.
-   CSS variables to switch colors dynamically.

------------------------------------------------------------------------

## Folder Structure

``` text
src/
├── context/
│   └── ThemeContext.tsx
├── components/
│   └── ThemeSwitcher.tsx
└── index.css
```

------------------------------------------------------------------------


## 1. Create the Context

`ThemeContext` stores the current theme and a function to toggle it.

``` ts
type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);
```

The context is initialized with `null` because the value is supplied by
`ThemeProvider`.

------------------------------------------------------------------------

## 2. Create the Provider

The provider owns the theme state.

``` ts
const [theme, setTheme] = useState<Theme>("light");
```

The initial theme is `"light"`.

------------------------------------------------------------------------

## 3. Toggle the Theme

``` ts
const toggleTheme = () => {
  setTheme(prev => (prev === "light" ? "dark" : "light"));
};
```

Using the functional state update guarantees that the latest state is
used.

------------------------------------------------------------------------

## 4. Synchronize the DOM

``` ts
useEffect(() => {
  document.documentElement.setAttribute("data-theme", theme);
}, [theme]);
```

Whenever `theme` changes:

-   React re-renders.
-   `useEffect` runs.
-   The `<html>` element receives a `data-theme` attribute.

Example:

``` html
<html data-theme="light">
```

or

``` html
<html data-theme="dark">
```

------------------------------------------------------------------------

## 5. Provide the Context

``` tsx
<ThemeContext.Provider value={{ theme, toggleTheme }}>
  {children}
</ThemeContext.Provider>
```

Every child component can now access the theme.

------------------------------------------------------------------------

## 6. Create a Custom Hook

``` ts
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
```

This avoids calling `useContext` directly throughout the application and
provides a helpful error if the provider is missing.

------------------------------------------------------------------------

## 7. Consume the Context

``` tsx
const { theme, toggleTheme } = useTheme();
```

Display the current theme:

``` tsx
<p>Current Theme: {theme}</p>
```

Toggle the theme:

``` tsx
<button onClick={toggleTheme}>
  Switch to {theme === "light" ? "Dark" : "Light"} Mode
</button>
```

------------------------------------------------------------------------

## 8. Theme with CSS Variables

``` css
[data-theme="light"] {
  --bg-color: #ffffff;
  --text-color: #111827;
}

[data-theme="dark"] {
  --bg-color: #0f172a;
  --text-color: #f1f5f9;
}
```

The CSS variables change based on the `data-theme` attribute.

Use them anywhere:

``` css
body {
  background: var(--bg-color);
}

.themeSwitcher {
  color: var(--text-color);
}

.themeBtn {
  background: var(--text-color);
  color: var(--bg-color);
}
```

------------------------------------------------------------------------

## Complete Flow

``` text
User clicks button
        │
        ▼
toggleTheme()
        │
        ▼
setTheme()
        │
        ▼
theme state updates
        │
        ▼
Component re-renders
        │
        ▼
useEffect executes
        │
        ▼
<html data-theme="dark">
        │
        ▼
CSS variables change
        │
        ▼
Entire UI updates
```

## How It Works
 
The theme system has three moving parts:
 
1. **`ThemeContext.tsx`** — owns the theme state and exposes it via context
2. **`ThemeSwitcher.tsx`** — a consumer component that reads and toggles the theme
3. **`index.css`** — defines the actual color values per theme using CSS variables

------------------------------------------------------------------------

### 1. Context Provider (`ThemeContext.tsx`)
 
`ThemeProvider` holds the single source of truth: a `theme` state value (`"light"` or `"dark"`), defaulting to `"light"`.
 
```ts
const [theme, setTheme] = useState<Theme>("light");
```
 
It exposes two things to the rest of the app through context:
 
- `theme` — the current value
- `toggleTheme` — a function that flips between `"light"` and `"dark"`
The key piece connecting React state to CSS is this effect:
 
```ts
useEffect(() => {
  document.documentElement.setAttribute("data-theme", theme);
}, [theme]);
```
 
Every time `theme` changes, it sets a `data-theme` attribute on the `<html>` tag (e.g. `<html data-theme="dark">`). This is what bridges React and CSS — no theme logic needs to touch the DOM styling directly.
 
A custom hook, `useTheme()`, wraps `useContext` so consuming components don't need to import `ThemeContext` directly, and throws a clear error if used outside the provider (i.e. if you forget to wrap your app in `<ThemeProvider>`).
 
### 2. Consumer Component (`ThemeSwitcher.tsx`)
 
This component doesn't manage any state itself. It just calls `useTheme()` to read the current theme and get the toggle function:
 
```ts
const { theme, toggleTheme } = useTheme();
```
 
Clicking the button calls `toggleTheme()`, which updates the state in the provider, which triggers the `useEffect` above, which updates the `data-theme` attribute, which — via CSS — repaints the page.
 
### 3. Styling (`theme.css`)
 
Rather than writing duplicate rule sets for light and dark mode, this approach defines **CSS variables per theme** using attribute selectors:
 
```css
[data-theme="light"] {
  --bg-color: #ffffff;
  --text-color: #111827;
}
 
[data-theme="dark"] {
  --bg-color: #0f172a;
  --text-color: #f1f5f9;
}
```
 
The actual component styles just reference the variables once:
 
```css
body {
  background-color: var(--bg-color);
}
 
.themeSwitcher {
  color: var(--text-color);
}
```
 
Because the variables are re-scoped based on the `data-theme` attribute, switching themes is just a matter of swapping the attribute value — no re-render of styles needed beyond what the browser already does for CSS variable changes.
 
Notably, `.themeBtn` intentionally inverts the two colors:
 
```css
.themeBtn {
  background-color: var(--text-color);
  color: var(--bg-color);
}
```
 
This keeps the button visibly distinct from the page background in both themes without needing separate button-specific variables.
 
## Setup
 
Wrap your app in the provider once, near the root:
 
```tsx
import { ThemeProvider } from "./context/ThemeContext";
 
function App() {
  return (
    <ThemeProvider>
      <ThemeSwitcher />
    </ThemeProvider>
  );
}
```
 
Any component inside `ThemeProvider` can then call `useTheme()` to read or toggle the theme.

## Why This Pattern
 
- **No prop drilling** — any nested component can access theme state via `useTheme()`.
- **CSS does the heavy lifting** — React only ever touches one DOM attribute; all visual changes are handled by CSS variable cascading.
- **Type-safe** — `Theme` is restricted to `"light" | "dark"`, so there's no risk of an invalid theme string being set.
- **Easy to extend** — adding a third theme (e.g. `"system"`) just means adding another `[data-theme="..."]` block in CSS and updating the `Theme` type and toggle logic.
## Possible Improvements
 
- Persist the chosen theme in `localStorage` so it survives page reloads.
- Detect the user's OS-level preference on first load via `window.matchMedia("(prefers-color-scheme: dark)")`.
- Add a `system` option that follows OS preference automatically.
