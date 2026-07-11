# React Router Interview Questions & Answers

> A comprehensive, topic-wise collection of React Router interview questions and answers — covering v5, v6, advanced patterns, and real-world use cases.

---

## Table of Contents

1. [React Router Fundamentals](#1-react-router-fundamentals)
2. [Core Components](#2-core-components)
3. [Hooks](#3-hooks)
4. [Navigation](#4-navigation)
5. [Route Parameters & Query Strings](#5-route-parameters--query-strings)
6. [Nested Routes](#6-nested-routes)
7. [Protected & Private Routes](#7-protected--private-routes)
8. [Layouts](#8-layouts)
9. [Data APIs (React Router v6.4+)](#9-data-apis-react-router-v64)
10. [React Router v5 vs v6](#10-react-router-v5-vs-v6)
11. [Advanced Patterns](#11-advanced-patterns)
12. [Error Handling](#12-error-handling)
13. [Code Splitting with React Router](#13-code-splitting-with-react-router)
14. [Testing React Router](#14-testing-react-router)
15. [Common Mistakes & Pitfalls](#15-common-mistakes--pitfalls)

---

## 1. React Router Fundamentals

### Q1. What is React Router?
**Answer:**
React Router is the standard routing library for React applications. It enables **client-side routing** — navigating between views/pages in a Single Page Application (SPA) without a full browser page reload.

Key capabilities:
- Declarative route definitions
- URL-based rendering of components
- Nested routing
- Dynamic route parameters
- Programmatic navigation
- History management (browser, hash, memory)

```bash
npm install react-router-dom
```

---

### Q2. What is client-side routing and how is it different from server-side routing?
**Answer:**

| Feature | Server-Side Routing | Client-Side Routing |
|---|---|---|
| How it works | Browser sends request to server for each URL | JavaScript intercepts navigation and renders the right component |
| Page reload | Full reload on every navigation | No reload — only JS re-renders |
| Speed | Slower (network round-trip) | Faster (instant UI updates) |
| SEO | Better (out of the box) | Needs extra setup (SSR / prerendering) |
| First load | Faster (server renders HTML) | Slower (JS bundle must load first) |
| Example | Traditional PHP/Rails apps | React SPA with React Router |

React Router intercepts anchor clicks, updates the browser URL via the **History API**, and renders the matched component — all without touching the server.

---

### Q3. What are the different types of routers in React Router?
**Answer:**

| Router | Description | Use Case |
|---|---|---|
| `BrowserRouter` | Uses HTML5 History API (`pushState`) | Standard web apps (most common) |
| `HashRouter` | Uses URL hash (`#/about`) | Static file hosting with no server config |
| `MemoryRouter` | Stores history in memory (no URL change) | Testing, React Native, non-browser environments |
| `StaticRouter` | No URL state changes | Server-side rendering |
| `NativeRouter` | For React Native apps | Mobile apps |
| `createBrowserRouter` | Data router (v6.4+) | Supports loaders, actions, error boundaries |

```jsx
// BrowserRouter — most common
import { BrowserRouter } from 'react-router-dom';
<BrowserRouter><App /></BrowserRouter>

// HashRouter — for GitHub Pages / static hosts
import { HashRouter } from 'react-router-dom';
<HashRouter><App /></HashRouter>

// createBrowserRouter — modern data API approach (v6.4+)
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
const router = createBrowserRouter([...routes]);
<RouterProvider router={router} />
```

---

### Q4. What is the difference between `BrowserRouter` and `HashRouter`?
**Answer:**

**BrowserRouter:**
- URLs look like: `https://example.com/about`
- Uses `window.history.pushState()` under the hood
- Requires server configuration to handle all routes (serve `index.html` for any path)
- Better for SEO

**HashRouter:**
- URLs look like: `https://example.com/#/about`
- Everything after `#` is not sent to the server
- No server configuration needed — the server always serves `index.html`
- Works on static hosts like GitHub Pages, Netlify (without redirects)

```nginx
# Server config needed for BrowserRouter (nginx example)
location / {
  try_files $uri /index.html; # Serve index.html for all routes
}
```

---

### Q5. What is the History API and how does React Router use it?
**Answer:**
The **HTML5 History API** (`window.history`) allows JavaScript to manipulate the browser's session history without page reloads.

Key methods React Router uses:
- `history.pushState(state, title, url)` — Add a new entry (navigate forward)
- `history.replaceState(state, title, url)` — Replace current entry
- `history.back()` / `history.forward()` / `history.go(n)` — Navigate history
- `popstate` event — Fires when user clicks back/forward buttons

React Router wraps this API to provide a consistent, declarative interface.

---

## 2. Core Components

### Q6. What is `<Routes>` and `<Route>`?
**Answer:**

`<Routes>` replaces `<Switch>` from v5. It looks through all child `<Route>` elements and renders the **first one that matches** the current URL.

`<Route>` defines a mapping between a URL path and a component.

```jsx
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/users" element={<Users />} />
      <Route path="/users/:id" element={<UserDetail />} />
      <Route path="*" element={<NotFound />} />  {/* Catch-all 404 */}
    </Routes>
  );
}
```

Key differences from v5 `<Switch>`:
- Uses `element` prop (not `component` or `render`)
- Matching is **exact by default** (no need for `exact` prop)
- Supports relative paths in nested routes

---

### Q7. What is `<Link>` and how is it different from `<a>`?
**Answer:**

`<Link>` renders an `<a>` tag but **prevents the default browser navigation** (full page reload). Instead, it uses the History API to update the URL and render the matching component.

```jsx
import { Link } from 'react-router-dom';

// ✅ React Router Link — no page reload
<Link to="/about">About</Link>

// ❌ Regular anchor — full page reload (loses React state)
<a href="/about">About</a>

// Link with state
<Link to="/profile" state={{ from: 'dashboard' }}>Profile</Link>

// Link replacing history instead of pushing
<Link to="/login" replace>Login</Link>
```

---

### Q8. What is `<NavLink>`?
**Answer:**

`<NavLink>` is a special version of `<Link>` that knows whether it is **active** (its `to` path matches the current URL). It automatically adds an `active` CSS class and `aria-current` attribute.

```jsx
import { NavLink } from 'react-router-dom';

// Basic — adds "active" class automatically when matched
<NavLink to="/about">About</NavLink>

// Custom active class
<NavLink
  to="/dashboard"
  className={({ isActive }) => isActive ? 'nav-active' : 'nav-link'}
>
  Dashboard
</NavLink>

// Custom style
<NavLink
  to="/settings"
  style={({ isActive }) => ({
    color: isActive ? 'hotpink' : 'inherit',
    fontWeight: isActive ? 'bold' : 'normal',
  })}
>
  Settings
</NavLink>

// End prop — only active on exact match (not on child routes)
<NavLink to="/" end>Home</NavLink>
```

---

### Q9. What is `<Navigate>`?
**Answer:**

`<Navigate>` is a component that **redirects** the user to a different route when rendered. It's the v6 replacement for `<Redirect>` in v5.

```jsx
import { Navigate } from 'react-router-dom';

// Simple redirect
function OldPage() {
  return <Navigate to="/new-page" />;
}

// Replace instead of push (no back button history entry)
function OldPage() {
  return <Navigate to="/new-page" replace />;
}

// Conditional redirect (protected route pattern)
function Dashboard() {
  const isAuthenticated = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardContent />;
}
```

---

### Q10. What is `<Outlet>`?
**Answer:**

`<Outlet>` is a placeholder in a parent route's component that renders the **matched child route's component**. It's essential for nested routing and shared layouts.

```jsx
import { Outlet } from 'react-router-dom';

// Parent layout component
function DashboardLayout() {
  return (
    <div>
      <Sidebar />
      <main>
        <Outlet />  {/* Child route renders here */}
      </main>
    </div>
  );
}

// Route config
<Routes>
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<DashboardHome />} />       {/* /dashboard */}
    <Route path="analytics" element={<Analytics />} /> {/* /dashboard/analytics */}
    <Route path="settings" element={<Settings />} />   {/* /dashboard/settings */}
  </Route>
</Routes>
```

---

### Q11. What is the `index` route?
**Answer:**

An index route is the **default child route** — it renders when the parent route's path is matched exactly and no other child route matches.

```jsx
<Routes>
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<DashboardOverview />} />  {/* Renders at /dashboard */}
    <Route path="stats" element={<Stats />} />       {/* Renders at /dashboard/stats */}
  </Route>
</Routes>
```

Think of it like `index.html` — it's what renders at the "root" of that layout.

---

## 3. Hooks

### Q12. What is `useNavigate`?
**Answer:**

`useNavigate` returns a function for **programmatic navigation** — navigating without a link click (e.g., after form submission, login, etc.).

```jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(credentials);

    if (success) {
      navigate('/dashboard');               // Push to history
      navigate('/dashboard', { replace: true }); // Replace (no back button)
      navigate(-1);                         // Go back one step
      navigate(-2);                         // Go back two steps
      navigate(1);                          // Go forward one step
      navigate('/profile', {
        state: { from: 'login' },           // Pass state
      });
    }
  };
}
```

---

### Q13. What is `useParams`?
**Answer:**

`useParams` returns an object of key/value pairs from the **dynamic segments** (`:paramName`) of the current URL.

```jsx
import { useParams } from 'react-router-dom';

// Route definition
<Route path="/users/:userId/posts/:postId" element={<Post />} />

// Component
function Post() {
  const { userId, postId } = useParams();
  // URL: /users/42/posts/7
  // userId = "42" (always string!)
  // postId = "7"

  // Convert to number if needed
  const id = parseInt(userId, 10);

  return <div>User {userId}, Post {postId}</div>;
}
```

> **Important:** Params are always strings — parse them if you need a number.

---

### Q14. What is `useLocation`?
**Answer:**

`useLocation` returns the **current location object**, which contains information about the current URL.

```jsx
import { useLocation } from 'react-router-dom';

function CurrentPage() {
  const location = useLocation();

  console.log(location.pathname); // "/users/42"
  console.log(location.search);   // "?tab=profile&sort=asc"
  console.log(location.hash);     // "#section-2"
  console.log(location.state);    // { from: 'dashboard' } — passed via navigate()
  console.log(location.key);      // Unique key for this history entry

  return <div>You are at: {location.pathname}</div>;
}

// Common use case: send user back after login
function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async () => {
    await login();
    navigate(from, { replace: true }); // Go back to where they came from
  };
}
```

---

### Q15. What is `useSearchParams`?
**Answer:**

`useSearchParams` reads and updates **URL query parameters** (`?key=value`). It returns a tuple similar to `useState`.

```jsx
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'price';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Write — updates the URL
  const handleCategoryChange = (cat) => {
    setSearchParams({ category: cat, sort, page: 1 });
  };

  // Update one param while keeping others
  const handleSortChange = (newSort) => {
    setSearchParams(prev => {
      prev.set('sort', newSort);
      return prev;
    });
  };

  return (
    <div>
      <select value={category} onChange={e => handleCategoryChange(e.target.value)}>
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
      </select>
      {/* URL updates to: ?category=electronics&sort=price&page=1 */}
    </div>
  );
}
```

---

### Q16. What is `useMatch`?
**Answer:**

`useMatch` returns match information if the current URL matches the given pattern, or `null` if it doesn't.

```jsx
import { useMatch } from 'react-router-dom';

function NavItem({ to, label }) {
  const match = useMatch(to);

  return (
    <li className={match ? 'active' : ''}>
      <Link to={to}>{label}</Link>
    </li>
  );
}

// With params
function UserBreadcrumb() {
  const match = useMatch('/users/:userId');
  // At /users/42: { params: { userId: '42' }, pathname: '/users/42', ... }
  // At /about: null

  if (!match) return null;
  return <span>User {match.params.userId}</span>;
}
```

---

### Q17. What is `useRoutes`?
**Answer:**

`useRoutes` is the hook equivalent of `<Routes>` — it accepts a route configuration array and returns a React element tree.

```jsx
import { useRoutes } from 'react-router-dom';

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      {
        path: 'users',
        element: <UsersLayout />,
        children: [
          { index: true, element: <UserList /> },
          { path: ':id', element: <UserDetail /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
];

function App() {
  const element = useRoutes(routes);
  return element;
}
```

This approach is useful when routes are dynamically generated or come from a configuration object.

---

### Q18. What is `useOutletContext`?
**Answer:**

`useOutletContext` allows a parent route component to pass data to child routes via the `<Outlet>` context prop.

```jsx
import { Outlet, useOutletContext } from 'react-router-dom';

// Parent route component
function UserLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser().then(setUser);
  }, []);

  return (
    <div>
      <UserHeader user={user} />
      <Outlet context={{ user, setUser }} />  {/* Pass context to children */}
    </div>
  );
}

// Child route component
function UserSettings() {
  const { user, setUser } = useOutletContext();
  // Access parent's user data without prop drilling or context API
  return <SettingsForm user={user} onSave={setUser} />;
}
```

---

## 4. Navigation

### Q19. What is the difference between `push` and `replace` navigation?
**Answer:**

- **Push** (`navigate('/path')`) — Adds a new entry to the browser history stack. The user can press the Back button to return to the previous page.
- **Replace** (`navigate('/path', { replace: true })`) — Replaces the current history entry. The Back button goes to the page before the replaced one.

```jsx
// Push — user can go back
navigate('/dashboard');

// Replace — user CANNOT go back to the previous page
navigate('/dashboard', { replace: true });

// Use replace for:
// 1. After login (don't let user go back to login page)
// 2. After form submit (prevent double-submit on back)
// 3. Redirects (don't pollute history)
```

---

### Q20. How do you pass data between routes?
**Answer:**

**1. URL Parameters (visible in URL):**
```jsx
navigate(`/users/${userId}`);
// Read with: useParams()
```

**2. Query String (visible, shareable):**
```jsx
navigate('/search?query=react&page=1');
// Read with: useSearchParams()
```

**3. Location State (hidden, not in URL):**
```jsx
navigate('/checkout', { state: { cart, total } });
// Read with: useLocation().state
// ⚠️ Lost on page refresh!
```

**4. Context / State Management:**
```jsx
// Zustand, Redux, Context API — persists across navigation
const { cart } = useCartStore();
```

---

### Q21. How do you navigate programmatically based on a condition?
**Answer:**

```jsx
function OrderForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const order = await submitOrder(formData);
      navigate(`/orders/${order.id}/confirmation`, {
        state: { order },
        replace: true,
      });
    } catch (error) {
      if (error.status === 401) navigate('/login', { replace: true });
      else if (error.status === 403) navigate('/unauthorized');
      else navigate('/error', { state: { message: error.message } });
    } finally {
      setLoading(false);
    }
  };
}
```

---

## 5. Route Parameters & Query Strings

### Q22. What is the difference between route params and query strings?
**Answer:**

| Feature | Route Params | Query Strings |
|---|---|---|
| URL example | `/users/42` | `/users?id=42` |
| Definition | `/users/:id` | No special route needed |
| Required/Optional | Usually required | Always optional |
| Best for | Resource identifiers | Filters, sorting, pagination |
| SEO | Better (clean URLs) | Acceptable |

```jsx
// Route param — identifies a specific resource
<Route path="/products/:productId" element={<Product />} />
// URL: /products/iphone-15

// Query string — filters/modifies how to view resources
// URL: /products?category=phones&sort=price&page=2
```

---

### Q23. How do you handle optional route parameters?
**Answer:**

React Router v6 doesn't support optional params with `?` directly. Use separate routes or query strings instead:

```jsx
// Approach 1: Two separate routes
<Routes>
  <Route path="/users" element={<UserList />} />
  <Route path="/users/:id" element={<UserDetail />} />
</Routes>

// Approach 2: Check param inside component
function UserPage() {
  const { id } = useParams();
  if (!id) return <UserList />;
  return <UserDetail id={id} />;
}

// Approach 3: Query string (most flexible)
// /users           → list all
// /users?id=42     → show user 42
```

---

### Q24. How do you handle catch-all / wildcard routes?
**Answer:**

Use `path="*"` to match any URL that didn't match previous routes:

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/users/*" element={<UsersSection />} /> {/* Matches /users/anything */}
  <Route path="*" element={<NotFound />} />            {/* 404 catch-all */}
</Routes>

// In UsersSection, you can have nested routes
function UsersSection() {
  return (
    <Routes>
      <Route index element={<UserList />} />
      <Route path=":id" element={<UserDetail />} />
    </Routes>
  );
}
```

---

## 6. Nested Routes

### Q25. How do nested routes work in React Router v6?
**Answer:**

Nested routes allow child routes to render **inside** their parent's component via `<Outlet>`. This enables shared layouts.

```jsx
// Route configuration
<Routes>
  <Route path="/app" element={<AppLayout />}>        {/* Shared layout */}
    <Route index element={<Dashboard />} />           {/* /app */}
    <Route path="profile" element={<Profile />} />   {/* /app/profile */}
    <Route path="settings" element={<Settings />}>   {/* /app/settings */}
      <Route index element={<GeneralSettings />} />  {/* /app/settings */}
      <Route path="account" element={<AccountSettings />} /> {/* /app/settings/account */}
      <Route path="security" element={<SecuritySettings />} /> {/* /app/settings/security */}
    </Route>
  </Route>
</Routes>

// AppLayout.jsx — parent component
function AppLayout() {
  return (
    <div className="app">
      <Navbar />
      <Sidebar />
      <main>
        <Outlet />  {/* Dashboard, Profile, or Settings renders here */}
      </main>
    </div>
  );
}
```

---

### Q26. How do you share layouts between routes without a URL prefix?
**Answer:**

Use a **pathless layout route** — a `<Route>` with no `path` prop, just an `element`. It provides the layout without adding to the URL.

```jsx
<Routes>
  {/* Public routes — no layout */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Pathless layout route — wraps with AuthLayout but no URL prefix */}
  <Route element={<AuthLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
  </Route>

  {/* Admin routes — different layout + prefix */}
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="users" element={<AdminUsers />} />
  </Route>
</Routes>
```

---

## 7. Protected & Private Routes

### Q27. How do you create protected routes in React Router v6?
**Answer:**

A protected route redirects unauthenticated users to the login page.

```jsx
// ProtectedRoute component
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Usage in routes
<Routes>
  <Route path="/login" element={<Login />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>

// Better: use layout route approach
<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<ProtectedLayout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/settings" element={<Settings />} />
  </Route>
</Routes>

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
```

---

### Q28. How do you redirect back to the original page after login?
**Answer:**

```jsx
// 1. Save the intended location when redirecting to login
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// 2. After login, navigate back to the saved location
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (credentials) => {
    await login(credentials);
    navigate(from, { replace: true }); // Replace so back button doesn't return to login
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

---

### Q29. How do you implement role-based access control with React Router?
**Answer:**

```jsx
function RoleProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Usage
<Routes>
  <Route
    path="/admin"
    element={
      <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminPanel />
      </RoleProtectedRoute>
    }
  />
  <Route
    path="/reports"
    element={
      <RoleProtectedRoute allowedRoles={['admin', 'analyst']}>
        <Reports />
      </RoleProtectedRoute>
    }
  />
</Routes>
```

---

## 8. Layouts

### Q30. What are the different layout patterns in React Router v6?
**Answer:**

**Pattern 1: Shared layout with URL prefix**
```jsx
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<Overview />} />
  <Route path="stats" element={<Stats />} />
</Route>
```

**Pattern 2: Pathless layout route (no URL prefix)**
```jsx
<Route element={<MainLayout />}>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
</Route>
```

**Pattern 3: Multiple layouts**
```jsx
<Routes>
  {/* Public pages — simple layout */}
  <Route element={<PublicLayout />}>
    <Route path="/" element={<Landing />} />
    <Route path="/pricing" element={<Pricing />} />
  </Route>

  {/* Auth pages — minimal layout */}
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
  </Route>

  {/* App pages — full layout with sidebar */}
  <Route element={<AppLayout />}>
    <Route path="/app" element={<Dashboard />} />
    <Route path="/app/settings" element={<Settings />} />
  </Route>
</Routes>
```

---

## 9. Data APIs (React Router v6.4+)

### Q31. What are loaders and actions in React Router v6.4?
**Answer:**

React Router v6.4 introduced **data APIs** inspired by Remix — `loader` and `action` functions that handle data fetching and mutation at the route level, before the component renders.

```jsx
import { createBrowserRouter, RouterProvider, useLoaderData } from 'react-router-dom';

// Loader — runs before the component renders, provides data
async function userLoader({ params }) {
  const response = await fetch(`/api/users/${params.userId}`);
  if (!response.ok) throw new Response('Not Found', { status: 404 });
  return response.json();
}

// Action — handles form submissions and mutations
async function updateUserAction({ request, params }) {
  const formData = await request.formData();
  const updatedUser = Object.fromEntries(formData);
  const response = await fetch(`/api/users/${params.userId}`, {
    method: 'PUT',
    body: JSON.stringify(updatedUser),
  });
  return response.json();
}

// Component — uses loader data
function UserProfile() {
  const user = useLoaderData(); // Data from loader
  return <div>{user.name}</div>;
}

// Route config
const router = createBrowserRouter([
  {
    path: '/users/:userId',
    element: <UserProfile />,
    loader: userLoader,
    action: updateUserAction,
    errorElement: <UserError />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
```

---

### Q32. What are `useLoaderData`, `useActionData`, and `useNavigation` hooks?
**Answer:**

```jsx
import { useLoaderData, useActionData, useNavigation, Form } from 'react-router-dom';

function UserEditPage() {
  const user = useLoaderData();        // Data returned by the loader
  const actionData = useActionData();  // Data returned by the action (after submit)
  const navigation = useNavigation();  // Current navigation state

  const isSubmitting = navigation.state === 'submitting';
  const isLoading = navigation.state === 'loading';

  return (
    <Form method="post">  {/* React Router's Form — triggers the action */}
      <input name="name" defaultValue={user.name} />
      <input name="email" defaultValue={user.email} />
      {actionData?.error && <p className="error">{actionData.error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </Form>
  );
}
```

---

### Q33. What is `defer` and `Await` in React Router?
**Answer:**

`defer` allows you to return **both resolved and pending promises** from a loader — so the page can render immediately with some data while waiting for slower data.

```jsx
import { defer, Await, useLoaderData, Suspense } from 'react-router-dom';

// Loader — defer slow data
async function productLoader({ params }) {
  const product = await fetchProduct(params.id); // Wait for this (critical)
  const reviews = fetchReviews(params.id);       // Don't wait (non-critical)

  return defer({
    product,    // Already resolved
    reviews,    // Still a Promise
  });
}

// Component
function ProductPage() {
  const { product, reviews } = useLoaderData();

  return (
    <div>
      <h1>{product.name}</h1>  {/* Renders immediately */}

      <Suspense fallback={<ReviewsSkeleton />}>
        <Await resolve={reviews} errorElement={<p>Failed to load reviews.</p>}>
          {(resolvedReviews) => <ReviewsList reviews={resolvedReviews} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

---

## 10. React Router v5 vs v6

### Q34. What are the major differences between React Router v5 and v6?
**Answer:**

| Feature | v5 | v6 |
|---|---|---|
| Route rendering | `component`, `render`, `children` props | `element` prop with JSX |
| Exact matching | `exact` prop required | Exact by default |
| Switch | `<Switch>` | `<Routes>` |
| Redirect | `<Redirect to="..." />` | `<Navigate to="..." />` |
| Nested routes | Defined in child components | Defined in parent route config |
| Wildcard | `path="*"` | `path="*"` (same) |
| Programmatic nav | `useHistory` | `useNavigate` |
| Active links | `<NavLink activeClassName>` | `<NavLink className={fn}>` |
| Route ranking | First match wins | Best match wins (automatic ranking) |
| `<Outlet>` | Not available | Required for nested routes |
| Data loading | Manual `useEffect` | Built-in `loader` / `action` |

```jsx
// V5
<Switch>
  <Route exact path="/" component={Home} />
  <Route path="/users/:id" render={({ match }) => <User id={match.params.id} />} />
  <Redirect from="/old" to="/new" />
</Switch>

// V6
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/users/:id" element={<User />} />   {/* useParams() inside User */}
  <Route path="/old" element={<Navigate to="/new" replace />} />
</Routes>
```

---

### Q35. How did `useHistory` change in v6?
**Answer:**

`useHistory` was removed in v6 and replaced with `useNavigate`:

```jsx
// V5
import { useHistory } from 'react-router-dom';
const history = useHistory();
history.push('/dashboard');
history.replace('/login');
history.go(-1);
history.goBack();
history.goForward();

// V6
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');
navigate('/login', { replace: true });
navigate(-1);
navigate(-1);   // goBack equivalent
navigate(1);    // goForward equivalent
```

---

## 11. Advanced Patterns

### Q36. How do you implement breadcrumbs with React Router?
**Answer:**

```jsx
import { Link, useLocation } from 'react-router-dom';

const ROUTE_LABELS = {
  '': 'Home',
  'dashboard': 'Dashboard',
  'users': 'Users',
  'settings': 'Settings',
};

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li>
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((segment, index) => {
          const path = '/' + pathnames.slice(0, index + 1).join('/');
          const isLast = index === pathnames.length - 1;
          const label = ROUTE_LABELS[segment] || segment;

          return (
            <li key={path}>
              {isLast ? (
                <span aria-current="page">{label}</span>
              ) : (
                <Link to={path}>{label}</Link>
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

### Q37. How do you scroll to the top on route change?
**Answer:**

```jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null; // No UI — just a side effect
}

// Use in App.jsx inside BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ... */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

### Q38. How do you track page views with React Router?
**Answer:**

```jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Google Analytics 4
    window.gtag?.('event', 'page_view', {
      page_path: location.pathname + location.search,
    });

    // Custom analytics
    analytics.track('Page Viewed', {
      path: location.pathname,
      search: location.search,
      referrer: document.referrer,
    });
  }, [location]);
}

function App() {
  usePageTracking(); // Call inside Router context
  return <Routes>...</Routes>;
}
```

---

### Q39. How do you implement route-based tabs?
**Answer:**

```jsx
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';

function UserProfile() {
  return (
    <div>
      <nav className="tabs">
        <NavLink to="overview" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          Overview
        </NavLink>
        <NavLink to="activity" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          Activity
        </NavLink>
        <NavLink to="repositories" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          Repositories
        </NavLink>
      </nav>

      <div className="tab-content">
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="activity" element={<Activity />} />
          <Route path="repositories" element={<Repositories />} />
        </Routes>
      </div>
    </div>
  );
}

// Parent route
<Route path="/users/:username/*" element={<UserProfile />} />
```

---

### Q40. How do you implement a multi-step form with routing?
**Answer:**

```jsx
const STEPS = ['personal', 'address', 'payment', 'review'];

function MultiStepForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentStep = location.pathname.split('/').pop();
  const currentIndex = STEPS.indexOf(currentStep);

  const goNext = () => {
    const next = STEPS[currentIndex + 1];
    if (next) navigate(`/checkout/${next}`);
  };

  const goPrev = () => {
    const prev = STEPS[currentIndex - 1];
    if (prev) navigate(`/checkout/${prev}`);
  };

  return (
    <div>
      <StepIndicator steps={STEPS} current={currentStep} />
      <Routes>
        <Route index element={<Navigate to="personal" replace />} />
        <Route path="personal" element={<PersonalStep onNext={goNext} />} />
        <Route path="address" element={<AddressStep onNext={goNext} onBack={goPrev} />} />
        <Route path="payment" element={<PaymentStep onNext={goNext} onBack={goPrev} />} />
        <Route path="review" element={<ReviewStep onBack={goPrev} />} />
      </Routes>
    </div>
  );
}
```

---

## 12. Error Handling

### Q41. How do you handle 404 Not Found routes?
**Answer:**

```jsx
// Catch-all route — always the last route
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} />
</Routes>

function NotFound() {
  const location = useLocation();
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>No page found at <code>{location.pathname}</code></p>
      <Link to="/">Go Home</Link>
    </div>
  );
}
```

---

### Q42. How do you handle route-level errors with `errorElement`? (v6.4+)
**Answer:**

```jsx
import { createBrowserRouter, useRouteError, isRouteErrorResponse } from 'react-router-dom';

function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    // HTTP errors from loader/action
    if (error.status === 404) return <NotFound />;
    if (error.status === 401) return <Unauthorized />;
    if (error.status === 403) return <Forbidden />;
    return <div>HTTP {error.status}: {error.statusText}</div>;
  }

  // Unexpected runtime errors
  return (
    <div>
      <h1>Something went wrong</h1>
      <p>{error?.message || 'Unknown error'}</p>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,  // Catches all child errors
    children: [
      {
        path: 'users/:id',
        element: <UserPage />,
        errorElement: <UserError />,        // Override for this specific route
        loader: userLoader,
      },
    ],
  },
]);
```

---

## 13. Code Splitting with React Router

### Q43. How do you implement code splitting with React Router?
**Answer:**

Combine `React.lazy()` and `<Suspense>` with route definitions:

```jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Each route component is loaded only when navigated to
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}
```

With Vite, you can also add comments for chunk naming:
```jsx
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './pages/Dashboard'));
```

---

## 14. Testing React Router

### Q44. How do you test components that use React Router hooks?
**Answer:**

Wrap components in `MemoryRouter` (or `createMemoryRouter` for data routers) for testing:

```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Helper function for rendering with router
function renderWithRouter(ui, { initialEntries = ['/'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

// Test a component using useParams
test('UserDetail renders correct user id', () => {
  renderWithRouter(
    <Routes>
      <Route path="/users/:id" element={<UserDetail />} />
    </Routes>,
    { initialEntries: ['/users/42'] }
  );

  expect(screen.getByText('User ID: 42')).toBeInTheDocument();
});

// Test navigation
test('Login redirects to dashboard after success', async () => {
  renderWithRouter(
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<div>Dashboard</div>} />
    </Routes>,
    { initialEntries: ['/login'] }
  );

  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  await waitFor(() => {
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

---

## 15. Common Mistakes & Pitfalls

### Q45. What are common React Router mistakes?
**Answer:**

**1. Forgetting `<BrowserRouter>` wrapper:**
```jsx
// ❌ Error: useNavigate can only be used inside a Router
function App() {
  return <Routes>...</Routes>; // No BrowserRouter!
}

// ✅
function App() {
  return (
    <BrowserRouter>
      <Routes>...</Routes>
    </BrowserRouter>
  );
}
```

**2. Using `<a>` instead of `<Link>`:**
```jsx
// ❌ Full page reload — loses React state
<a href="/about">About</a>

// ✅
<Link to="/about">About</Link>
```

**3. Using `navigate()` outside a component (outside Router context):**
```jsx
// ❌ Doesn't work
const navigate = useNavigate(); // at module level

// ✅ Call hooks inside components
function MyComponent() {
  const navigate = useNavigate();
}
```

**4. Index as key in route lists:**
```jsx
// ❌ Unstable keys
routes.map((route, i) => <Route key={i} path={route.path} element={route.element} />)

// ✅ Stable keys
routes.map(route => <Route key={route.path} path={route.path} element={route.element} />)
```

**5. Forgetting `<Outlet>` in layout components:**
```jsx
// ❌ Child routes render nowhere
function DashboardLayout() {
  return <div><Sidebar /></div>; // Missing Outlet!
}

// ✅
function DashboardLayout() {
  return <div><Sidebar /><Outlet /></div>;
}
```

**6. `navigate()` called during render:**
```jsx
// ❌ Navigate during render
function Component() {
  const navigate = useNavigate();
  navigate('/somewhere'); // Side effect in render!
}

// ✅ Use Navigate component or put in useEffect
function Component() {
  return <Navigate to="/somewhere" replace />;
}
```

---

### Quick Reference

```jsx
// Setup
<BrowserRouter><App /></BrowserRouter>

// Routes
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/users/:id" element={<User />} />
  <Route path="*" element={<NotFound />} />
</Routes>

// Navigation
<Link to="/about">About</Link>
<NavLink to="/nav" className={({ isActive }) => isActive ? 'active' : ''}>Nav</NavLink>
<Navigate to="/redirect" replace />

// Hooks
const navigate = useNavigate();
const { id } = useParams();
const location = useLocation();
const [searchParams, setSearchParams] = useSearchParams();
const match = useMatch('/path/:param');
const data = useLoaderData();
```

---

*This document covers 45+ React Router interview questions across 15 topics.*
