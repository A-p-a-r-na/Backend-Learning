# React — Implementation-Based Interview Questions & Answers

> "How would you implement..." style questions with complete working code. Covers the most asked practical React interview implementations.

---

## Table of Contents

1. [Theme & Appearance](#1-theme--appearance)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Search & Filtering](#3-search--filtering)
4. [Pagination & Infinite Scroll](#4-pagination--infinite-scroll)
5. [Forms & Validation](#5-forms--validation)
6. [Data Fetching Patterns](#6-data-fetching-patterns)
7. [Navigation & Routing](#7-navigation--routing)
8. [Notifications & Feedback](#8-notifications--feedback)
9. [Modals & Overlays](#9-modals--overlays)
10. [Drag, Drop & Sorting](#10-drag-drop--sorting)
11. [Real-Time Features](#11-real-time-features)
12. [Performance Implementations](#12-performance-implementations)
13. [Accessibility Implementations](#13-accessibility-implementations)
14. [Custom Hooks Implementations](#14-custom-hooks-implementations)
15. [Animation & Transitions](#15-animation--transitions)
16. [File & Media Handling](#16-file--media-handling)
17. [State Management Implementations](#17-state-management-implementations)
18. [Layout & UI Patterns](#18-layout--ui-patterns)

---

## 1. Theme & Appearance

---

### Q1. How do you implement Light and Dark Mode in React?

**The complete implementation with 3 approaches:**

---

#### Approach 1 — CSS Variables + Context (Recommended)

```jsx
// 1. Define CSS variables for both themes
/* index.css */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border: #e5e7eb;
  --accent: #6366f1;
  --card-bg: #ffffff;
  --shadow: rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border: #334155;
  --accent: #818cf8;
  --card-bg: #1e293b;
  --shadow: rgba(0, 0, 0, 0.4);
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background 0.3s ease, color 0.3s ease;
}

// 2. Theme Context
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Priority: localStorage → system preference → default light
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Apply theme to the HTML element
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only change if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');
  const setSystemTheme = () => {
    localStorage.removeItem('theme');
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// 3. Toggle Button Component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '50px',
        padding: '6px 14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-primary)',
        fontSize: '14px',
        transition: 'all 0.2s',
      }}
    >
      <span>{theme === 'light' ? '🌙' : '☀️'}</span>
      <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
}

// 4. Three-option theme switcher (Light / Dark / System)
function ThemeSwitcher() {
  const { theme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
  const [selected, setSelected] = useState('system');

  const options = [
    { id: 'light', label: 'Light', icon: '☀️', action: setLightTheme },
    { id: 'dark', label: 'Dark', icon: '🌙', action: setDarkTheme },
    { id: 'system', label: 'System', icon: '💻', action: setSystemTheme },
  ];

  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg-secondary)',
      borderRadius: '8px',
      padding: '4px',
      gap: '2px',
      border: '1px solid var(--border)',
    }}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => { opt.action(); setSelected(opt.id); }}
          aria-pressed={selected === opt.id}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: selected === opt.id ? 'var(--accent)' : 'transparent',
            color: selected === opt.id ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
        >
          <span aria-hidden="true">{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// 5. Usage in components — just use CSS variables
function Card({ title, content }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: `0 2px 8px var(--shadow)`,
      color: 'var(--text-primary)',
    }}>
      <h2 style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <p style={{ color: 'var(--text-secondary)' }}>{content}</p>
    </div>
  );
}

// 6. Wrap App
function App() {
  return (
    <ThemeProvider>
      <Header />
      <main><Card title="Hello" content="This card adapts to the theme" /></main>
    </ThemeProvider>
  );
}
```

---

#### Approach 2 — Tailwind CSS Dark Mode

```jsx
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  // ...
};

// ThemeProvider for Tailwind
function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() =>
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Components use Tailwind dark: prefix
function Card() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 transition-colors duration-300">
      <h2 className="text-gray-900 dark:text-white font-semibold">Title</h2>
      <p className="text-gray-500 dark:text-gray-400">Content</p>
    </div>
  );
}
```

---

#### Approach 3 — styled-components ThemeProvider

```jsx
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

const lightTheme = {
  bg: '#ffffff',
  text: '#111827',
  border: '#e5e7eb',
  accent: '#6366f1',
};

const darkTheme = {
  bg: '#0f172a',
  text: '#f1f5f9',
  border: '#334155',
  accent: '#818cf8',
};

const GlobalStyle = createGlobalStyle`
  body {
    background: ${props => props.theme.bg};
    color: ${props => props.theme.text};
    transition: all 0.3s ease;
  }
`;

const StyledCard = styled.div`
  background: ${props => props.theme.bg};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 20px;
  h2 { color: ${props => props.theme.text}; }
`;

function App() {
  const [isDark, setIsDark] = useState(false);
  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <GlobalStyle />
      <button onClick={() => setIsDark(d => !d)}>Toggle</button>
      <StyledCard><h2>Themed Card</h2></StyledCard>
    </ThemeProvider>
  );
}
```

---

### Q2. How do you implement a theme that persists across browser sessions and respects system preferences?

```jsx
function useThemePreference() {
  const getInitialTheme = () => {
    // 1. Check localStorage first
    const stored = localStorage.getItem('theme-preference');
    if (stored) return stored;

    // 2. Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';

    // 3. Default
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);

    // Persist (null means "follow system")
    if (theme === 'system') {
      localStorage.removeItem('theme-preference');
    } else {
      localStorage.setItem('theme-preference', theme);
    }
  }, [theme]);

  // Update meta theme-color for mobile browsers
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
    }
  }, [theme]);

  return { theme, setTheme };
}
```

---

### Q3. How do you implement a color scheme / accent color picker?

```jsx
const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f59e0b' },
];

function AccentColorPicker() {
  const [accent, setAccent] = useState('#6366f1');

  const handleChange = (color) => {
    setAccent(color);
    document.documentElement.style.setProperty('--accent', color);
    // Derive hover/lighter shade
    document.documentElement.style.setProperty('--accent-light', color + '20');
    localStorage.setItem('accent-color', color);
  };

  return (
    <div>
      <p style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
        Accent Color
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        {ACCENT_COLORS.map(c => (
          <button
            key={c.value}
            onClick={() => handleChange(c.value)}
            aria-label={`Set accent to ${c.name}`}
            aria-pressed={accent === c.value}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: c.value,
              border: accent === c.value ? `3px solid var(--text-primary)` : '3px solid transparent',
              cursor: 'pointer',
              transition: 'transform 0.15s',
              transform: accent === c.value ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 2. Authentication & Authorization

---

### Q4. How do you implement a Login / Logout flow in React?

```jsx
// Auth Context
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : null)
        .then(user => setUser(user))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }

    const { user, token } = await res.json();
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = { user, login, logout, loading, isAuthenticated: !!user };

  if (loading) return <FullPageLoader />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

// Login Form
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '32px',
      background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '24px' }}>Welcome back</h1>

      {error && (
        <div role="alert" style={{ background: '#fee2e2', color: '#991b1b',
          padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
            autoComplete="email"
            placeholder="you@example.com"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)',
              borderRadius: '8px', fontSize: '15px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="current-password"
              style={{ width: '100%', padding: '10px 44px 10px 14px', border: '1px solid var(--border)',
                borderRadius: '8px', fontSize: '15px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
```

---

### Q5. How do you implement role-based access control (RBAC) in React?

```jsx
// Permission system
const PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'manage_users', 'view_analytics'],
  editor: ['read', 'write'],
  viewer: ['read'],
};

function usePermission() {
  const { user } = useAuth();

  const can = (permission) => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(permission) ?? false;
  };

  const canAny = (...permissions) => permissions.some(can);
  const canAll = (...permissions) => permissions.every(can);

  return { can, canAny, canAll, role: user?.role };
}

// Guard component
function PermissionGate({ permission, fallback = null, children }) {
  const { can } = usePermission();
  return can(permission) ? children : fallback;
}

// Usage
function AdminPanel() {
  const { can } = usePermission();

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Show/hide based on permission */}
      <PermissionGate permission="write">
        <button>Create Post</button>
      </PermissionGate>

      <PermissionGate
        permission="delete"
        fallback={<p>You don't have permission to delete.</p>}
      >
        <button>Delete Post</button>
      </PermissionGate>

      {/* Inline check */}
      {can('manage_users') && <UserManagementPanel />}
      {can('view_analytics') && <AnalyticsDashboard />}
    </div>
  );
}

// Route-level protection with role
function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/403" replace />;
  return children;
}

<Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminPage /></RoleRoute>} />
<Route path="/editor" element={<RoleRoute allowedRoles={['admin', 'editor']}><EditorPage /></RoleRoute>} />
```

---

## 3. Search & Filtering

---

### Q6. How do you implement a live search with debouncing and highlighting?

```jsx
import { useState, useEffect, useMemo } from 'react';

// Highlight matching text
function HighlightText({ text, query }) {
  if (!query.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ background: '#fef08a', borderRadius: '2px', padding: '0 1px' }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function LiveSearch({ data, searchKeys = ['name'] }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return data;
    const lower = debouncedQuery.toLowerCase();
    return data.filter(item =>
      searchKeys.some(key =>
        String(item[key]).toLowerCase().includes(lower)
      )
    );
  }, [data, debouncedQuery, searchKeys]);

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search..."
          style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid var(--border)',
            borderRadius: '8px', fontSize: '15px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        />
        {isSearching && (
          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            ⟳
          </span>
        )}
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        {debouncedQuery ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${debouncedQuery}"` : `${data.length} total`}
      </p>

      {results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '32px' }}>🔍</p>
          <p>No results for "<strong>{debouncedQuery}</strong>"</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {results.map(item => (
            <li key={item.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <HighlightText text={item.name} query={debouncedQuery} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### Q7. How do you implement multi-filter functionality (filter by category, price range, rating)?

```jsx
import { useState, useMemo, useCallback } from 'react';

const initialFilters = {
  categories: [],
  priceRange: { min: 0, max: 10000 },
  minRating: 0,
  inStock: false,
  sortBy: 'relevance',
};

function useFilters(data) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleCategory = useCallback((category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const resetFilters = useCallback(() => setFilters(initialFilters), []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
    if (filters.minRating > 0) count++;
    if (filters.inStock) count++;
    return count;
  }, [filters]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.categories.length > 0) {
      result = result.filter(item => filters.categories.includes(item.category));
    }

    result = result.filter(item =>
      item.price >= filters.priceRange.min &&
      item.price <= filters.priceRange.max
    );

    if (filters.minRating > 0) {
      result = result.filter(item => item.rating >= filters.minRating);
    }

    if (filters.inStock) {
      result = result.filter(item => item.stock > 0);
    }

    switch (filters.sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default: break;
    }

    return result;
  }, [data, filters]);

  return { filters, filteredData, updateFilter, toggleCategory, resetFilters, activeFilterCount };
}

function FilterPanel({ data }) {
  const { filters, filteredData, updateFilter, toggleCategory, resetFilters, activeFilterCount } = useFilters(data);

  const allCategories = [...new Set(data.map(item => item.category))];

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      {/* Filter Sidebar */}
      <aside style={{ width: '240px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</h3>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Clear all
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Category
          </h4>
          {allCategories.map(cat => (
            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                style={{ accentColor: 'var(--accent)' }}
              />
              {cat}
            </label>
          ))}
        </div>

        {/* Price Range */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Price Range
          </h4>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min}
              onChange={e => updateFilter('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
              style={{ width: '50%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max}
              onChange={e => updateFilter('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
              style={{ width: '50%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Min Rating
          </h4>
          {[4, 3, 2, 1].map(rating => (
            <label key={rating} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => updateFilter('minRating', rating)}
                style={{ accentColor: 'var(--accent)' }}
              />
              {'★'.repeat(rating)}{'☆'.repeat(5 - rating)} & above
            </label>
          ))}
        </div>

        {/* In Stock */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={e => updateFilter('inStock', e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          In Stock Only
        </label>
      </aside>

      {/* Results */}
      <main style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {filteredData.length} products
          </p>
          <select
            value={filters.sortBy}
            onChange={e => updateFilter('sortBy', e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {filteredData.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

---

## 4. Pagination & Infinite Scroll

---

### Q8. How do you implement a reusable Pagination component?

```jsx
function usePagination({ totalItems, itemsPerPage = 10, siblingCount = 1 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getPageNumbers = () => {
    const totalPageNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 dots
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);
    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => totalPages - (3 + 2 * siblingCount) + i + 1);
      return [1, '...', ...rightRange];
    }

    const middleRange = Array.from({ length: rightSibling - leftSibling + 1 }, (_, i) => leftSibling + i);
    return [1, '...', ...middleRange, '...', totalPages];
  };

  const goTo = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const next = () => goTo(currentPage + 1);
  const prev = () => goTo(currentPage - 1);

  return {
    currentPage,
    totalPages,
    pageNumbers: getPageNumbers(),
    goTo,
    next,
    prev,
    canNext: currentPage < totalPages,
    canPrev: currentPage > 1,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: Math.min(currentPage * itemsPerPage, totalItems),
  };
}

function Pagination({ totalItems, itemsPerPage, onPageChange }) {
  const { currentPage, totalPages, pageNumbers, goTo, next, prev, canNext, canPrev } = usePagination({ totalItems, itemsPerPage });

  useEffect(() => { onPageChange?.(currentPage); }, [currentPage]);

  const btnStyle = (active, disabled) => ({
    padding: '8px 12px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: active ? 'var(--accent)' : 'var(--bg-primary)',
    color: active ? 'white' : disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    opacity: disabled ? 0.5 : 1,
    minWidth: '40px',
    transition: 'all 0.15s',
  });

  return (
    <nav aria-label="Pagination" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', margin: '24px 0' }}>
      <button onClick={prev} disabled={!canPrev} aria-label="Previous page" style={btnStyle(false, !canPrev)}>‹</button>

      {pageNumbers.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>…</span>
        ) : (
          <button
            key={page}
            onClick={() => goTo(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            style={btnStyle(currentPage === page, false)}
          >
            {page}
          </button>
        )
      )}

      <button onClick={next} disabled={!canNext} aria-label="Next page" style={btnStyle(false, !canNext)}>›</button>

      <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        Page {currentPage} of {totalPages}
      </span>
    </nav>
  );
}
```

---

## 5. Forms & Validation

---

### Q9. How do you implement a real-time password strength indicator?

```jsx
function usePasswordStrength(password) {
  const checks = useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);

  const score = Object.values(checks).filter(Boolean).length;

  const strength = score === 0 ? null :
    score <= 2 ? { label: 'Weak', color: '#ef4444', width: '25%' } :
    score <= 3 ? { label: 'Fair', color: '#f59e0b', width: '50%' } :
    score <= 4 ? { label: 'Good', color: '#3b82f6', width: '75%' } :
    { label: 'Strong', color: '#10b981', width: '100%' };

  return { checks, strength };
}

function PasswordInput({ value, onChange }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const { checks, strength } = usePasswordStrength(value);

  const requirements = [
    { key: 'length', label: 'At least 8 characters' },
    { key: 'uppercase', label: 'One uppercase letter' },
    { key: 'lowercase', label: 'One lowercase letter' },
    { key: 'number', label: 'One number' },
    { key: 'special', label: 'One special character' },
  ];

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Create password"
          style={{ width: '100%', padding: '10px 44px 10px 14px', border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '8px', fontSize: '15px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>

      {/* Strength bar */}
      {value && strength && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '2px', transition: 'all 0.3s ease' }} />
          </div>
          <p style={{ fontSize: '12px', color: strength.color, marginTop: '4px', fontWeight: '600' }}>
            {strength.label}
          </p>
        </div>
      )}

      {/* Requirements checklist */}
      {focused && (
        <ul style={{ listStyle: 'none', padding: '8px 0', margin: '8px 0 0 0' }}>
          {requirements.map(req => (
            <li key={req.key} style={{ display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', color: checks[req.key] ? '#10b981' : 'var(--text-secondary)', marginBottom: '4px', transition: 'color 0.2s' }}>
              <span>{checks[req.key] ? '✓' : '○'}</span>
              {req.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### Q10. How do you implement form validation with custom rules?

```jsx
function useForm({ initialValues, validationRules, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((fieldValues = values) => {
    const newErrors = {};
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = fieldValues[field];
      for (const rule of rules) {
        const error = rule(value, fieldValues);
        if (error) { newErrors[field] = error; break; }
      }
    });
    return newErrors;
  }, [values, validationRules]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validate(newValues)[field] || '' }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validate()[field] || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setIsSubmitting(true);
    try { await onSubmit(values); }
    finally { setIsSubmitting(false); }
  };

  const isValid = Object.keys(validate()).length === 0;

  return { values, errors, touched, isSubmitting, isValid, handleChange, handleBlur, handleSubmit };
}

// Validation rule helpers
const rules = {
  required: (msg = 'This field is required') => (val) => !val?.toString().trim() ? msg : null,
  email: () => (val) => val && !/\S+@\S+\.\S+/.test(val) ? 'Invalid email address' : null,
  minLength: (min) => (val) => val && val.length < min ? `Minimum ${min} characters` : null,
  maxLength: (max) => (val) => val && val.length > max ? `Maximum ${max} characters` : null,
  matches: (field, msg) => (val, allValues) => val !== allValues[field] ? msg : null,
  pattern: (regex, msg) => (val) => val && !regex.test(val) ? msg : null,
};

// Usage
function SignupForm() {
  const form = useForm({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationRules: {
      name: [rules.required(), rules.minLength(2)],
      email: [rules.required(), rules.email()],
      password: [rules.required(), rules.minLength(8)],
      confirmPassword: [rules.required(), rules.matches('password', 'Passwords must match')],
    },
    onSubmit: async (values) => {
      await registerUser(values);
    },
  });

  const fieldStyle = (field) => ({
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${form.touched[field] && form.errors[field] ? '#ef4444' : 'var(--border)'}`,
    borderRadius: '8px',
    fontSize: '15px',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      {['name', 'email', 'password', 'confirmPassword'].map(field => (
        <div key={field} style={{ marginBottom: '16px' }}>
          <label htmlFor={field} style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' }}>
            {field.replace(/([A-Z])/g, ' $1')}
          </label>
          <input
            id={field}
            type={field.includes('password') || field.includes('Password') ? 'password' : field === 'email' ? 'email' : 'text'}
            value={form.values[field]}
            onChange={form.handleChange(field)}
            onBlur={form.handleBlur(field)}
            style={fieldStyle(field)}
            aria-invalid={!!(form.touched[field] && form.errors[field])}
            aria-describedby={form.errors[field] ? `${field}-error` : undefined}
          />
          {form.touched[field] && form.errors[field] && (
            <p id={`${field}-error`} role="alert" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {form.errors[field]}
            </p>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={form.isSubmitting}
        style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: 'white',
          border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', opacity: form.isSubmitting ? 0.7 : 1 }}
      >
        {form.isSubmitting ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
```

---

## 6. Data Fetching Patterns

---

### Q11. How do you implement optimistic updates?

```jsx
// Optimistic update — update UI immediately, revert if server fails
function useTodos() {
  const [todos, setTodos] = useState([]);

  const toggleTodo = async (id) => {
    // 1. Save previous state for rollback
    const previousTodos = todos;

    // 2. Optimistically update UI immediately
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));

    try {
      // 3. Make API call
      await fetch(`/api/todos/${id}/toggle`, { method: 'PATCH' });
      // Success — optimistic update was correct, nothing more to do
    } catch (error) {
      // 4. Rollback on failure
      setTodos(previousTodos);
      showToast({ message: 'Failed to update. Please try again.', type: 'error' });
    }
  };

  const deleteTodo = async (id) => {
    const previousTodos = todos;
    setTodos(prev => prev.filter(t => t.id !== id)); // Optimistic delete

    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    } catch {
      setTodos(previousTodos); // Rollback
    }
  };

  const addTodo = async (text) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTodo = { id: tempId, text, completed: false, _pending: true };

    setTodos(prev => [...prev, optimisticTodo]);

    try {
      const saved = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      }).then(r => r.json());

      // Replace temp with real data from server
      setTodos(prev => prev.map(t => t.id === tempId ? saved : t));
    } catch {
      setTodos(prev => prev.filter(t => t.id !== tempId));
    }
  };

  return { todos, toggleTodo, deleteTodo, addTodo };
}
```

---

## 7. Navigation & Routing

---

### Q12. How do you implement a breadcrumb navigation that updates dynamically?

```jsx
// Route config with meta
const routeConfig = {
  '/': { label: 'Home' },
  '/dashboard': { label: 'Dashboard' },
  '/dashboard/users': { label: 'Users' },
  '/dashboard/users/:id': { label: 'User Details' },
  '/dashboard/settings': { label: 'Settings' },
};

function useBreadcrumbs() {
  const location = useLocation();
  const params = useParams();

  const crumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter(Boolean);

    return [
      { label: 'Home', path: '/' },
      ...pathnames.map((_, index) => {
        const path = '/' + pathnames.slice(0, index + 1).join('/');
        const routePattern = Object.keys(routeConfig).find(route => {
          const pattern = route.replace(/:[\w]+/g, '[^/]+');
          return new RegExp(`^${pattern}$`).test(path);
        });

        let label = routePattern
          ? routeConfig[routePattern]?.label
          : pathnames[index].charAt(0).toUpperCase() + pathnames[index].slice(1);

        // Replace dynamic labels with actual values
        if (params.id && label === 'User Details') {
          label = `User #${params.id}`;
        }

        return { label, path };
      }),
    ];
  }, [location.pathname, params]);

  return crumbs;
}

function Breadcrumbs() {
  const crumbs = useBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb">
      <ol style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, gap: '4px', alignItems: 'center', fontSize: '14px' }}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {index > 0 && <span aria-hidden="true" style={{ color: 'var(--text-secondary)' }}>/</span>}
              {isLast ? (
                <span aria-current="page" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.path} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

---

## 8. Notifications & Feedback

---

### Q13. How do you implement a notification badge / unread count?

```jsx
function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastRead, setLastRead] = useState(Date.now());
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => new Date(n.createdAt) > new Date(lastRead)).length;

  // Real-time via WebSocket
  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/notifications');
    ws.onmessage = (e) => {
      const notification = JSON.parse(e.data);
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    };
    return () => ws.close();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = () => {
    setIsOpen(o => !o);
    if (!isOpen) setLastRead(Date.now());
  };

  const markAllRead = () => setLastRead(Date.now());

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
          padding: '8px', borderRadius: '8px', fontSize: '20px' }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute', top: '4px', right: '4px',
              background: '#ef4444', color: 'white',
              fontSize: '11px', fontWeight: '700',
              minWidth: '18px', height: '18px',
              borderRadius: '99px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px', lineHeight: 1,
              border: '2px solid var(--bg-primary)',
              animation: 'pulse 1s ease infinite',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: '360px', background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: '12px', boxShadow: '0 8px 32px var(--shadow)', zIndex: 100,
          maxHeight: '480px', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '32px', margin: 0 }}>🔕</p>
                <p style={{ marginTop: '8px', fontSize: '14px' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const isUnread = new Date(notif.createdAt) > new Date(lastRead);
                return (
                  <div key={notif.id} style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--border)',
                    background: isUnread ? 'var(--bg-secondary)' : 'transparent',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '20px' }}>{notif.icon || '📌'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: isUnread ? '600' : '400', color: 'var(--text-primary)' }}>
                          {notif.title}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {notif.body}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {new Date(notif.createdAt).toRelativeTimeString?.() ?? new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {isUnread && (
                        <span style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', marginTop: '4px', flexShrink: 0 }} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 9. Modals & Overlays

---

### Q14. How do you implement a Confirmation Dialog?

```jsx
import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [config, setConfig] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfig({
        title: 'Are you sure?',
        message: 'This action cannot be undone.',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        variant: 'danger',
        ...options,
        onConfirm: () => { setConfig(null); resolve(true); },
        onCancel: () => { setConfig(null); resolve(false); },
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {config && <ConfirmDialog {...config} />}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);

function ConfirmDialog({ title, message, confirmText, cancelText, variant, onConfirm, onCancel }) {
  const VARIANT_COLORS = {
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        padding: '20px',
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div style={{
        background: 'var(--card-bg)', borderRadius: '16px', padding: '28px',
        maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'scaleIn 0.2s ease',
      }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%',
          background: VARIANT_COLORS[variant] + '20', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '24px', marginBottom: '16px' }}>
          {variant === 'danger' ? '🗑️' : variant === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <h2 id="confirm-title" style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            autoFocus
            style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: '8px',
              background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '10px 20px', border: 'none', borderRadius: '8px',
              background: VARIANT_COLORS[variant], color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Usage — anywhere in the app
function DeleteButton({ itemId }) {
  const confirm = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete this item?',
      message: 'This will permanently delete the item and all associated data.',
      confirmText: 'Delete',
      cancelText: 'Keep it',
      variant: 'danger',
    });

    if (confirmed) {
      await deleteItem(itemId);
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

---

## 10. Drag, Drop & Sorting

---

### Q15. How do you implement a sortable list with keyboard support?

```jsx
function SortableList({ items: initialItems, onReorder }) {
  const [items, setItems] = useState(initialItems);
  const [dragging, setDragging] = useState(null);
  const [focused, setFocused] = useState(null);

  // Keyboard reorder
  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      setItems(newItems);
      setFocused(index - 1);
      onReorder?.(newItems);
    }
    if (e.key === 'ArrowDown' && index < items.length - 1) {
      e.preventDefault();
      const newItems = [...items];
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
      setItems(newItems);
      setFocused(index + 1);
      onReorder?.(newItems);
    }
  };

  const handleDrop = (dropIndex) => {
    if (dragging === null || dragging === dropIndex) return;
    const newItems = [...items];
    const [moved] = newItems.splice(dragging, 1);
    newItems.splice(dropIndex, 0, moved);
    setItems(newItems);
    setDragging(null);
    onReorder?.(newItems);
  };

  useEffect(() => {
    if (focused !== null) {
      document.querySelectorAll('[data-sortable]')[focused]?.focus();
    }
  }, [focused]);

  return (
    <ul role="listbox" aria-label="Sortable list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((item, index) => (
        <li
          key={item.id}
          data-sortable
          draggable
          tabIndex={0}
          role="option"
          aria-selected={focused === index}
          aria-label={`${item.label}, position ${index + 1} of ${items.length}. Use arrow keys to reorder.`}
          onDragStart={() => setDragging(index)}
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(index)}
          onDragEnd={() => setDragging(null)}
          onKeyDown={e => handleKeyDown(e, index)}
          onFocus={() => setFocused(index)}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', marginBottom: '8px', borderRadius: '10px',
            background: dragging === index ? 'var(--bg-secondary)' : 'var(--card-bg)',
            border: `1px solid ${focused === index ? 'var(--accent)' : 'var(--border)'}`,
            cursor: 'grab', opacity: dragging === index ? 0.5 : 1,
            outline: 'none', transition: 'all 0.15s', fontSize: '14px',
            boxShadow: focused === index ? `0 0 0 2px var(--accent)20` : 'none',
          }}
        >
          <span aria-hidden="true" style={{ color: 'var(--text-secondary)', fontSize: '16px', cursor: 'grab' }}>⠿</span>
          <span style={{ flex: 1 }}>{item.label}</span>
          <span aria-hidden="true" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            #{index + 1}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

---

## 12. Performance Implementations

---

### Q16. How do you implement a virtualized list from scratch?

```jsx
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return (
    <div
      ref={containerRef}
      onScroll={e => setScrollTop(e.target.scrollTop)}
      style={{ height: containerHeight, overflowY: 'auto', position: 'relative' }}
    >
      {/* Full height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
          {visibleItems.map((item, i) => (
            <div
              key={items[visibleStart + i].id}
              style={{ height: itemHeight, display: 'flex', alignItems: 'center',
                padding: '0 16px', borderBottom: '1px solid var(--border)' }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Usage
const items = Array.from({ length: 100000 }, (_, i) => ({ id: i, label: `Item ${i + 1}` }));
<VirtualList items={items} itemHeight={50} containerHeight={600} />
```

---

## 14. Custom Hooks Implementations

---

### Q17. How do you implement a useWindowSize hook?

```jsx
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...size,
    isMobile: size.width < 768,
    isTablet: size.width >= 768 && size.width < 1024,
    isDesktop: size.width >= 1024,
  };
}
```

---

### Q18. How do you implement a useOnClickOutside hook?

```jsx
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Usage
function Dropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref}>
      <button onClick={() => setOpen(o => !o)}>Toggle</button>
      {open && <div className="dropdown-menu">Menu content</div>}
    </div>
  );
}
```

---

### Q19. How do you implement a useCopyToClipboard hook?

```jsx
function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), resetDelay);
    } catch (err) {
      setError(err);
      setCopied(false);
    }
  }, [resetDelay]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { copy, copied, error };
}

// Usage
function CodeBlock({ code }) {
  const { copy, copied } = useCopyToClipboard();

  return (
    <div style={{ position: 'relative' }}>
      <pre><code>{code}</code></pre>
      <button
        onClick={() => copy(code)}
        style={{ position: 'absolute', top: '8px', right: '8px',
          background: copied ? '#10b981' : 'var(--bg-secondary)',
          color: copied ? 'white' : 'var(--text-primary)',
          border: '1px solid var(--border)', borderRadius: '6px',
          padding: '4px 10px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' }}
      >
        {copied ? '✓ Copied!' : 'Copy'}
      </button>
    </div>
  );
}
```

---

### Q20. How do you implement a useIntersectionObserver hook?

```jsx
function useIntersectionObserver(options = {}) {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setEntry(entry), options);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, options.threshold, options.root, options.rootMargin]);

  return [setNode, entry];
}

// Lazy image loading
function LazyImage({ src, alt, ...props }) {
  const [ref, entry] = useIntersectionObserver({ threshold: 0.1, rootMargin: '100px' });
  const [loaded, setLoaded] = useState(false);
  const shouldLoad = entry?.isIntersecting;

  return (
    <div ref={ref} style={{ background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', ...props.style }}>
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{ width: '100%', opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
          {...props}
        />
      )}
    </div>
  );
}

// Animate on scroll
function AnimateOnScroll({ children, animation = 'fadeInUp' }) {
  const [ref, entry] = useIntersectionObserver({ threshold: 0.1 });
  const isVisible = entry?.isIntersecting;

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {children}
    </div>
  );
}
```

---

## 15. Animation & Transitions

---

### Q21. How do you implement a smooth page transition?

```jsx
// Using CSS transitions + React state
function PageTransition({ children, location }) {
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  return (
    <div
      style={{
        opacity: transitionStage === 'fadeIn' ? 1 : 0,
        transform: transitionStage === 'fadeIn' ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
      onTransitionEnd={() => {
        if (transitionStage === 'fadeOut') {
          setDisplayLocation(location);
          setTransitionStage('fadeIn');
        }
      }}
    >
      {children}
    </div>
  );
}

// In App.jsx
function App() {
  const location = useLocation();
  return (
    <PageTransition location={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </PageTransition>
  );
}
```

---

### Q22. How do you implement a skeleton loading screen?

```jsx
// Skeleton animation via CSS
/* 
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
*/

function Skeleton({ width = '100%', height = '16px', borderRadius = '6px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--border) 50%, var(--bg-secondary) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

// Card skeleton
function CardSkeleton() {
  return (
    <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--card-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Skeleton width="48px" height="48px" borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton height="14px" width="60%" style={{ marginBottom: '8px' }} />
          <Skeleton height="12px" width="40%" />
        </div>
      </div>
      <Skeleton height="12px" style={{ marginBottom: '8px' }} />
      <Skeleton height="12px" width="85%" style={{ marginBottom: '8px' }} />
      <Skeleton height="12px" width="70%" />
    </div>
  );
}

// Usage with conditional rendering
function UserCard({ userId }) {
  const { user, isLoading } = useUser(userId);
  if (isLoading) return <CardSkeleton />;
  return <div>{user.name}</div>;
}
```

---

## 16. File & Media Handling

---

### Q23. How do you implement a drag-and-drop file upload?

```jsx
function FileUpload({ onUpload, accept = '*', maxSize = 5 * 1024 * 1024, multiple = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > maxSize) return `File too large (max ${maxSize / 1024 / 1024}MB)`;
    if (accept !== '*' && !accept.split(',').some(type => file.type.match(type.trim()))) {
      return `Invalid file type`;
    }
    return null;
  };

  const processFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      error: validateFile(file),
      status: 'pending',
    }));
    setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    const validFiles = files.filter(f => !f.error);
    if (validFiles.length === 0) return;
    setUploading(true);

    for (const fileItem of validFiles) {
      const formData = new FormData();
      formData.append('file', fileItem.file);

      try {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          setProgress(prev => ({ ...prev, [fileItem.id]: Math.round((e.loaded / e.total) * 100) }));
        };

        await new Promise((resolve, reject) => {
          xhr.onload = resolve;
          xhr.onerror = reject;
          xhr.open('POST', '/api/upload');
          xhr.send(formData);
        });

        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'done' } : f));
        onUpload?.(fileItem);
      } catch {
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error' } : f));
      }
    }
    setUploading(false);
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Drop files here or click to browse"
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'var(--accent)10' : 'var(--bg-secondary)',
          transition: 'all 0.2s',
        }}
      >
        <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📁</p>
        <p style={{ fontWeight: '600', margin: '0 0 4px', color: 'var(--text-primary)' }}>
          {isDragging ? 'Drop files here' : 'Drag & drop or click to upload'}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Max {maxSize / 1024 / 1024}MB per file
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={e => processFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {files.map(fileItem => (
            <div key={fileItem.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', border: '1px solid var(--border)',
              borderRadius: '8px', marginBottom: '8px', background: 'var(--card-bg)',
            }}>
              {fileItem.preview && (
                <img src={fileItem.preview} alt={fileItem.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fileItem.name}
                </p>
                {fileItem.error ? (
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#ef4444' }}>{fileItem.error}</p>
                ) : progress[fileItem.id] !== undefined ? (
                  <div style={{ marginTop: '4px' }}>
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress[fileItem.id]}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.2s' }} />
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {progress[fileItem.id]}%
                    </p>
                  </div>
                ) : (
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {(fileItem.size / 1024).toFixed(1)} KB {fileItem.status === 'done' && '✓'}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeFile(fileItem.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '18px', padding: '4px' }}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={uploading || files.every(f => f.error)}
            style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              opacity: uploading ? 0.7 : 1, marginTop: '8px' }}
          >
            {uploading ? 'Uploading...' : `Upload ${files.filter(f => !f.error).length} file(s)`}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 18. Layout & UI Patterns

---

### Q24. How do you implement a responsive Sidebar layout?

```jsx
function SidebarLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isMobile } = useWindowSize();

  // Close sidebar on mobile when route changes
  const location = useLocation();
  useEffect(() => { if (isMobile) setIsOpen(false); }, [location, isMobile]);

  const sidebarWidth = isCollapsed && !isMobile ? '64px' : '240px';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Main navigation"
        style={{
          width: sidebarWidth,
          height: '100vh',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'relative',
          zIndex: 50,
          transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease, width 0.2s ease',
          flexShrink: 0,
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        {/* Collapse button — desktop only */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(c => !c)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ position: 'absolute', top: '12px', right: '8px', background: 'none',
              border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '18px' }}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        )}

        <nav style={{ padding: '16px 8px', flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed && !isMobile ? item.label : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                textDecoration: 'none',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent)15' : 'transparent',
                fontWeight: isActive ? '600' : '400',
                fontSize: '14px',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
              {(!isCollapsed || isMobile) && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: '56px', borderBottom: '1px solid var(--border)', display: 'flex',
          alignItems: 'center', padding: '0 16px', gap: '12px', background: 'var(--bg-primary)', flexShrink: 0 }}>
          {isMobile && (
            <button
              onClick={() => setIsOpen(o => !o)}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '4px' }}
            >
              ☰
            </button>
          )}
          <div style={{ flex: 1 }} />
          <ThemeToggle />
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/users', icon: '👥', label: 'Users' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];
```

---

### Q25. How do you implement a command palette (⌘K menu)?

```jsx
function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const COMMANDS = [
    { id: 'home', label: 'Go to Home', icon: '🏠', action: () => navigate('/'), group: 'Navigate' },
    { id: 'dash', label: 'Go to Dashboard', icon: '📊', action: () => navigate('/dashboard'), group: 'Navigate' },
    { id: 'theme', label: 'Toggle Theme', icon: '🌙', action: toggleTheme, group: 'Appearance' },
    { id: 'new', label: 'Create New Post', icon: '✏️', action: () => navigate('/new'), group: 'Actions' },
    { id: 'logout', label: 'Sign Out', icon: '👋', action: logout, group: 'Account' },
  ];

  // Open on ⌘K or Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return COMMANDS;
    return COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  useEffect(() => {
    if (open) { inputRef.current?.focus(); setQuery(''); setActiveIndex(0); }
  }, [open]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) { filtered[activeIndex].action(); setOpen(false); }
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '20vh' }}
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div style={{ width: '560px', maxWidth: '90vw', background: 'var(--card-bg)',
        borderRadius: '14px', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '15px',
              color: 'var(--text-primary)' }}
          />
          <kbd style={{ fontSize: '11px', color: 'var(--text-secondary)', border: '1px solid var(--border)',
            borderRadius: '4px', padding: '2px 6px' }}>ESC</kbd>
        </div>

        <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0', fontSize: '14px' }}>
              No commands found
            </p>
          ) : (
            filtered.map((cmd, i) => (
              <div
                key={cmd.id}
                onClick={() => { cmd.action(); setOpen(false); }}
                onMouseEnter={() => setActiveIndex(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                  background: i === activeIndex ? 'var(--accent)15' : 'transparent',
                  border: i === activeIndex ? `1px solid var(--accent)30` : '1px solid transparent',
                  marginBottom: '2px', transition: 'all 0.1s',
                }}
              >
                <span style={{ fontSize: '18px' }}>{cmd.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', fontWeight: i === activeIndex ? '500' : '400', color: 'var(--text-primary)' }}>
                    {cmd.label}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)',
                  background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                  {cmd.group}
                </span>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
          {[['↑↓', 'Navigate'], ['↵', 'Select'], ['Esc', 'Close']].map(([key, label]) => (
            <span key={key} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <kbd style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 5px', fontSize: '11px' }}>
                {key}
              </kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
```

---

### Quick Implementation Cheatsheet

```
Feature                  Key Technique
───────────────────────────────────────────────────────
Light/Dark Mode          CSS variables + data-theme attr + localStorage
Auth Flow                Context + localStorage token + protected routes
Live Search              useState + debounce(300ms) + useMemo filter
Multi Filter             useReducer + useMemo derived state
Pagination               Custom hook + smart page number calculation
Password Strength        Regex checks + computed score + visual bar
Optimistic Updates       Save prev state → update → rollback on error
Drag & Drop              HTML5 drag API + onDragStart/onDrop events
Infinite Scroll          IntersectionObserver sentinel div
File Upload              FileReader + XMLHttpRequest progress events
Notification Badge       WebSocket + unread count from lastRead timestamp
Command Palette          Portal + global keydown ⌘K + fuzzy search
Skeleton Loading         CSS shimmer animation + conditional render
Copy to Clipboard        navigator.clipboard.writeText + timeout reset
Virtual List             scrollTop / itemHeight math + absolute positioning
Breadcrumbs              useLocation + pathname split + route matching
Sidebar Responsive       useWindowSize + transform translateX
Confirm Dialog           Context + Promise resolve pattern
Form Validation          Custom rules array + touched + errors state
```

---

*This document covers 25 complete implementation-based questions across 18 categories — every answer includes full working React code.*
