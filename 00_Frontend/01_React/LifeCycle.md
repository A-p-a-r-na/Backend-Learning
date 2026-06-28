# React Lifecycle Methods — Class & Functional Components

> A complete, in-depth guide to React component lifecycle — covering every phase, method, and hook with examples, diagrams, and comparisons.

---

## Table of Contents

1. [What is a Component Lifecycle?](#1-what-is-a-component-lifecycle)
2. [Class Component Lifecycle — Overview](#2-class-component-lifecycle--overview)
3. [Mounting Phase (Class)](#3-mounting-phase-class)
4. [Updating Phase (Class)](#4-updating-phase-class)
5. [Unmounting Phase (Class)](#5-unmounting-phase-class)
6. [Error Handling Phase (Class)](#6-error-handling-phase-class)
7. [Deprecated Lifecycle Methods](#7-deprecated-lifecycle-methods)
8. [Functional Component Lifecycle with Hooks](#8-functional-component-lifecycle-with-hooks)
9. [useEffect In Depth](#9-useeffect-in-depth)
10. [useLayoutEffect vs useEffect](#10-uselayouteffect-vs-useeffect)
11. [Class vs Functional — Side-by-Side Comparison](#11-class-vs-functional--side-by-side-comparison)
12. [Lifecycle Flow Diagrams](#12-lifecycle-flow-diagrams)
13. [Common Patterns & Use Cases](#13-common-patterns--use-cases)
14. [Common Mistakes & Pitfalls](#14-common-mistakes--pitfalls)
15. [Interview Questions & Answers](#15-interview-questions--answers)

---

## 1. What is a Component Lifecycle?

Every React component goes through a series of phases from the moment it is created to the moment it is destroyed. These phases are collectively called the **component lifecycle**.

The three main phases are:

| Phase | Description |
|---|---|
| **Mounting** | Component is created and inserted into the DOM |
| **Updating** | Component re-renders due to state or prop changes |
| **Unmounting** | Component is removed from the DOM |

Additionally, there is an **Error Handling** phase for catching errors in child components.

---

## 2. Class Component Lifecycle — Overview

```
MOUNTING                    UPDATING                    UNMOUNTING
─────────────────────────   ─────────────────────────   ─────────────
constructor()               getDerivedStateFromProps()  componentWillUnmount()
getDerivedStateFromProps()  shouldComponentUpdate()
render()                    render()
componentDidMount()         getSnapshotBeforeUpdate()
                            componentDidUpdate()
```

---

## 3. Mounting Phase (Class)

The mounting phase occurs when a component is being created and inserted into the DOM for the first time. The methods are called in the following order:

---

### 3.1 `constructor(props)`

The constructor is the first method called when a component is instantiated.

**Purpose:**
- Initialize `this.state`
- Bind event handler methods to `this`

**Rules:**
- Must call `super(props)` before anything else
- Do NOT call `setState()` here — set state directly
- Do NOT cause side effects here

```jsx
class Counter extends React.Component {
  constructor(props) {
    super(props); // REQUIRED — passes props to React.Component

    // Initialize state
    this.state = {
      count: props.initialCount || 0,
      name: '',
    };

    // Bind event handlers
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return <button onClick={this.handleClick}>{this.state.count}</button>;
  }
}
```

---

### 3.2 `static getDerivedStateFromProps(props, state)`

Called right before rendering — both on initial mount and on every subsequent update.

**Purpose:**
- Sync component state with changes in props

**Rules:**
- Must be a `static` method
- Returns an object to update state, or `null` to update nothing
- Has no access to `this` (it's static)
- Rarely needed — prefer controlled components

```jsx
class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.defaultValue };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Only update state if the prop changed
    if (nextProps.defaultValue !== prevState.prevDefaultValue) {
      return {
        value: nextProps.defaultValue,
        prevDefaultValue: nextProps.defaultValue,
      };
    }
    return null; // No state update needed
  }

  render() {
    return <input value={this.state.value} readOnly />;
  }
}
```

---

### 3.3 `render()`

The only **required** lifecycle method in a class component.

**Purpose:**
- Returns the JSX (or null) that describes what to display

**Rules:**
- Must be a **pure function** — same output for same state/props
- Do NOT modify state here
- Do NOT call side effects here
- Can return: JSX, arrays, fragments, portals, strings, numbers, booleans, or `null`

```jsx
class Profile extends React.Component {
  render() {
    const { user, isLoading } = this.props;

    if (isLoading) return <Spinner />;
    if (!user) return null;

    return (
      <div className="profile">
        <h1>{user.name}</h1>
        <p>{user.email}</p>
      </div>
    );
  }
}
```

---

### 3.4 `componentDidMount()`

Called immediately after the component is mounted (inserted into the DOM).

**Purpose:**
- Fetch data from APIs
- Set up subscriptions, timers, or event listeners
- Interact with the DOM directly (measure dimensions, etc.)
- Initialize third-party libraries

**Key point:** `setState()` called here triggers a second render, but it happens before the browser updates the screen — so the user won't see the intermediate state.

```jsx
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { users: [], loading: true, error: null };
  }

  async componentDidMount() {
    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      this.setState({ users, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }

  render() {
    const { users, loading, error } = this.state;
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
  }
}
```

---

## 4. Updating Phase (Class)

The updating phase happens when a component's state or props change, causing a re-render.

**Triggers for re-render:**
- `this.setState()` is called
- New props are received from the parent
- `this.forceUpdate()` is called

---

### 4.1 `static getDerivedStateFromProps(props, state)` *(called again)*

Same as in the mounting phase — called before every render. See section 3.2.

---

### 4.2 `shouldComponentUpdate(nextProps, nextState)`

Called before re-rendering when new props or state are received.

**Purpose:**
- Performance optimization — skip unnecessary re-renders by returning `false`

**Rules:**
- Return `true` to allow re-render (default)
- Return `false` to prevent re-render
- Do NOT call `setState()` here (infinite loop risk)
- Do NOT cause side effects

```jsx
class ExpensiveList extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render if the list data or filter actually changed
    return (
      nextProps.items !== this.props.items ||
      nextState.filter !== this.state.filter
    );
  }

  render() {
    return (
      <ul>
        {this.props.items
          .filter(item => item.includes(this.state.filter))
          .map(item => <li key={item}>{item}</li>)
        }
      </ul>
    );
  }
}
```

> **Note:** `React.PureComponent` automatically implements `shouldComponentUpdate` with a shallow prop/state comparison.

---

### 4.3 `render()` *(called again)*

Same render method — produces the updated JSX. See section 3.3.

---

### 4.4 `getSnapshotBeforeUpdate(prevProps, prevState)`

Called right before the DOM is updated (after render but before the real DOM is patched).

**Purpose:**
- Capture information from the DOM before it changes (e.g., scroll position)
- Returns a value passed as the third argument to `componentDidUpdate`

```jsx
class ChatWindow extends React.Component {
  constructor(props) {
    super(props);
    this.listRef = React.createRef();
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // Capture scroll position before new messages are added
    if (prevProps.messages.length < this.props.messages.length) {
      const list = this.listRef.current;
      return list.scrollHeight - list.scrollTop;
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Restore scroll position after new messages are added
    if (snapshot !== null) {
      const list = this.listRef.current;
      list.scrollTop = list.scrollHeight - snapshot;
    }
  }

  render() {
    return (
      <div ref={this.listRef} style={{ overflowY: 'scroll', height: '400px' }}>
        {this.props.messages.map(msg => <div key={msg.id}>{msg.text}</div>)}
      </div>
    );
  }
}
```

---

### 4.5 `componentDidUpdate(prevProps, prevState, snapshot)`

Called immediately after an update. Not called on the initial render.

**Purpose:**
- Respond to prop/state changes (e.g., fetch new data when a prop changes)
- Interact with the DOM after an update
- Network requests based on comparison of previous and current props/state

**Rules:**
- Always wrap `setState()` in a condition to avoid infinite loops
- `snapshot` comes from `getSnapshotBeforeUpdate`

```jsx
class SearchResults extends React.Component {
  componentDidUpdate(prevProps, prevState) {
    // Only fetch if the search query changed
    if (prevProps.query !== this.props.query) {
      this.fetchResults(this.props.query);
    }

    // Only scroll to top if page changed
    if (prevProps.page !== this.props.page) {
      window.scrollTo(0, 0);
    }
  }

  async fetchResults(query) {
    const data = await fetch(`/api/search?q=${query}`).then(r => r.json());
    this.setState({ results: data });
  }

  render() {
    return <ResultsList results={this.state.results} />;
  }
}
```

---

## 5. Unmounting Phase (Class)

### 5.1 `componentWillUnmount()`

Called immediately before a component is removed from the DOM.

**Purpose:**
- Clean up subscriptions
- Cancel pending network requests
- Clear timers (`clearTimeout`, `clearInterval`)
- Remove manual event listeners
- Cancel animations

**Rules:**
- Do NOT call `setState()` here — the component is about to be destroyed

```jsx
class TimerComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { seconds: 0 };
    this.intervalId = null;
  }

  componentDidMount() {
    // Start timer
    this.intervalId = setInterval(() => {
      this.setState(prev => ({ seconds: prev.seconds + 1 }));
    }, 1000);

    // Add resize listener
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    // CRITICAL: Clean up to prevent memory leaks
    clearInterval(this.intervalId);
    window.removeEventListener('resize', this.handleResize);
    // Cancel any pending API calls (e.g., AbortController)
  }

  handleResize = () => {
    // handle resize
  };

  render() {
    return <p>Seconds elapsed: {this.state.seconds}</p>;
  }
}
```

---

## 6. Error Handling Phase (Class)

### 6.1 `static getDerivedStateFromError(error)`

Called when a child component throws an error. Used to update state to show a fallback UI.

```jsx
static getDerivedStateFromError(error) {
  // Return state update to display the fallback UI
  return { hasError: true, errorMessage: error.message };
}
```

---

### 6.2 `componentDidCatch(error, info)`

Called after an error has been thrown. Used for logging errors.

```jsx
componentDidCatch(error, info) {
  // Log error to an error reporting service
  logErrorToService(error, info.componentStack);
}
```

**Complete Error Boundary Example:**

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Caught error:', error);
    console.error('Component stack:', info.componentStack);
    // Send to Sentry, Datadog, etc.
    reportError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## 7. Deprecated Lifecycle Methods

These methods are prefixed with `UNSAFE_` in React 16.3+ and should NOT be used in new code.

| Deprecated Method | Why Deprecated | Replacement |
|---|---|---|
| `componentWillMount` / `UNSAFE_componentWillMount` | Runs on server + client; causes issues with async rendering | `componentDidMount` |
| `componentWillReceiveProps` / `UNSAFE_componentWillReceiveProps` | Confusing semantics, called even when props don't change | `getDerivedStateFromProps` |
| `componentWillUpdate` / `UNSAFE_componentWillUpdate` | Unsafe with async rendering | `getSnapshotBeforeUpdate` |

```jsx
// ❌ DEPRECATED — DO NOT USE
UNSAFE_componentWillMount() {}
UNSAFE_componentWillReceiveProps(nextProps) {}
UNSAFE_componentWillUpdate(nextProps, nextState) {}
```

---

## 8. Functional Component Lifecycle with Hooks

Functional components don't have lifecycle methods — instead, they use **hooks** to achieve the same behavior.

### Mapping of Lifecycle → Hooks

| Class Lifecycle Method | Functional Hook Equivalent |
|---|---|
| `constructor` | `useState` initialization |
| `componentDidMount` | `useEffect(() => { ... }, [])` |
| `componentDidUpdate` | `useEffect(() => { ... }, [dep])` |
| `componentWillUnmount` | `useEffect(() => { return () => cleanup() }, [])` |
| `shouldComponentUpdate` | `React.memo` / `useMemo` |
| `getDerivedStateFromProps` | Derive values during render |
| `getSnapshotBeforeUpdate` | `useLayoutEffect` |
| `getDerivedStateFromError` | No direct hook (use class ErrorBoundary) |
| `componentDidCatch` | No direct hook (use class ErrorBoundary) |

---

### 8.1 Initialization (replaces `constructor`)

```jsx
// Class
constructor(props) {
  super(props);
  this.state = { count: props.initial || 0 };
}

// Functional
function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial);
  // ...
}
```

For **expensive initial state**, use lazy initialization:

```jsx
// The function is only called once on mount
const [data, setData] = useState(() => {
  return expensiveComputation(); // Called once, not on every render
});
```

---

### 8.2 `componentDidMount` equivalent

```jsx
// Class
componentDidMount() {
  fetchData();
  window.addEventListener('resize', this.handleResize);
}

// Functional
useEffect(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
}, []); // Empty array = run once after mount
```

---

### 8.3 `componentDidUpdate` equivalent

```jsx
// Class
componentDidUpdate(prevProps) {
  if (prevProps.userId !== this.props.userId) {
    this.fetchUser(this.props.userId);
  }
}

// Functional
useEffect(() => {
  fetchUser(userId);
}, [userId]); // Runs when userId changes
```

---

### 8.4 `componentWillUnmount` equivalent

```jsx
// Class
componentWillUnmount() {
  clearInterval(this.timer);
  window.removeEventListener('resize', this.handleResize);
}

// Functional — return a cleanup function from useEffect
useEffect(() => {
  const timer = setInterval(() => setCount(c => c + 1), 1000);
  window.addEventListener('resize', handleResize);

  return () => {
    // This runs before the component unmounts
    clearInterval(timer);
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

---

### 8.5 Combined Mount + Update + Unmount

```jsx
function DataFetcher({ resourceId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const controller = new AbortController();

    setLoading(true);

    fetch(`/api/resource/${resourceId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError' && isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort(); // Cancel pending request on cleanup
    };
  }, [resourceId]); // Re-run whenever resourceId changes

  if (loading) return <Spinner />;
  return <Display data={data} />;
}
```

---

### 8.6 `shouldComponentUpdate` equivalent — `React.memo`

```jsx
// Class
shouldComponentUpdate(nextProps) {
  return nextProps.value !== this.props.value;
}

// Functional
const MyComponent = React.memo(function MyComponent({ value }) {
  return <div>{value}</div>;
});

// With custom comparison
const MyComponent = React.memo(
  function MyComponent({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true to SKIP re-render (opposite of shouldComponentUpdate!)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

---

## 9. useEffect In Depth

### 9.1 The Dependency Array

The dependency array controls when `useEffect` runs:

```jsx
// 1. No dependency array — runs after EVERY render
useEffect(() => {
  console.log('Runs after every render');
});

// 2. Empty array — runs ONCE after initial mount
useEffect(() => {
  console.log('Runs once on mount');
}, []);

// 3. With dependencies — runs when any dep changes
useEffect(() => {
  console.log('Runs when count or name changes');
}, [count, name]);
```

---

### 9.2 The Cleanup Function

The function returned from `useEffect` runs:
- Before the component unmounts
- Before the next effect runs (when dependencies change)

```jsx
useEffect(() => {
  const subscription = subscribe(userId);

  return () => {
    // Cleanup runs BEFORE next effect AND on unmount
    subscription.unsubscribe();
  };
}, [userId]);
```

**Order of execution when `userId` changes:**
1. Component renders with new `userId`
2. Previous effect's cleanup runs (unsubscribe old userId)
3. New effect runs (subscribe new userId)

---

### 9.3 Avoiding Stale Closures

A stale closure happens when an effect captures an old value of a variable:

```jsx
// ❌ Bug — count is always 0 because it was captured at mount time
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // stale closure! count is always 0
  }, 1000);
  return () => clearInterval(id);
}, []);

// ✅ Fix 1 — use functional state update
useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1); // always uses latest value
  }, 1000);
  return () => clearInterval(id);
}, []);

// ✅ Fix 2 — add to dependency array
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]); // now re-runs when count changes
```

---

### 9.4 Fetching Data with useEffect

```jsx
function useUserData(userId) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return; // Guard clause

    const controller = new AbortController();
    setStatus('loading');

    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setUser(data);
        setStatus('success');
      } catch (err) {
        if (err.name === 'AbortError') return; // Ignore aborts
        setError(err.message);
        setStatus('error');
      }
    }

    fetchUser();
    return () => controller.abort();
  }, [userId]);

  return { user, status, error };
}
```

---

### 9.5 Common useEffect Patterns

**Timer / Interval:**
```jsx
useEffect(() => {
  const id = setTimeout(() => setVisible(false), 3000);
  return () => clearTimeout(id);
}, []);
```

**Event Listener:**
```jsx
useEffect(() => {
  const handler = (e) => setKey(e.key);
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

**WebSocket / Subscription:**
```jsx
useEffect(() => {
  const ws = new WebSocket('wss://example.com/ws');
  ws.onmessage = (e) => setMessages(prev => [...prev, e.data]);
  return () => ws.close();
}, []);
```

**Sync with localStorage:**
```jsx
useEffect(() => {
  localStorage.setItem('theme', theme);
}, [theme]);
```

**Document title:**
```jsx
useEffect(() => {
  document.title = `(${unreadCount}) Messages`;
}, [unreadCount]);
```

---

## 10. useLayoutEffect vs useEffect

| Feature | `useEffect` | `useLayoutEffect` |
|---|---|---|
| When it runs | After browser paint | After DOM update, before paint |
| Blocking | Non-blocking (async) | Blocking (sync) |
| Use case | Most side effects | DOM measurement, preventing flicker |
| SSR | Safe | Causes hydration warning |

```
Render → DOM updated → useLayoutEffect → Browser paints → useEffect
```

### When to use `useLayoutEffect`:

```jsx
function Tooltip({ targetRef, children }) {
  const tooltipRef = useRef();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // useLayoutEffect prevents flicker — tooltip appears in the right position
  useLayoutEffect(() => {
    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    setPosition({
      top: targetRect.bottom + window.scrollY,
      left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
    });
  }, [targetRef]);

  return (
    <div
      ref={tooltipRef}
      style={{ position: 'absolute', top: position.top, left: position.left }}
    >
      {children}
    </div>
  );
}
```

---

## 11. Class vs Functional — Side-by-Side Comparison

### Full Component Comparison

```jsx
// ─────────────────────────────────────
// CLASS COMPONENT
// ─────────────────────────────────────
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      posts: [],
    };
  }

  async componentDidMount() {
    const user = await fetchUser(this.props.userId);
    this.setState({ user, loading: false });

    const posts = await fetchPosts(this.props.userId);
    this.setState({ posts });

    document.title = `Profile — ${user.name}`;
    window.addEventListener('focus', this.handleFocus);
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.setState({ loading: true });
      const user = await fetchUser(this.props.userId);
      this.setState({ user, loading: false });
      document.title = `Profile — ${user.name}`;
    }
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.handleFocus);
    document.title = 'App';
  }

  handleFocus = () => console.log('Window focused');

  render() {
    const { user, loading, posts } = this.state;
    if (loading) return <Spinner />;
    return (
      <div>
        <h1>{user.name}</h1>
        <PostList posts={posts} />
      </div>
    );
  }
}


// ─────────────────────────────────────
// FUNCTIONAL COMPONENT (equivalent)
// ─────────────────────────────────────
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  // Fetch user when userId changes (mount + update)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchUser(userId).then(user => {
      if (!cancelled) {
        setUser(user);
        setLoading(false);
        document.title = `Profile — ${user.name}`;
      }
    });

    return () => {
      cancelled = true;
      document.title = 'App'; // cleanup on unmount
    };
  }, [userId]);

  // Fetch posts separately
  useEffect(() => {
    fetchPosts(userId).then(setPosts);
  }, [userId]);

  // Window focus listener (mount/unmount only)
  useEffect(() => {
    const handleFocus = () => console.log('Window focused');
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (loading) return <Spinner />;
  return (
    <div>
      <h1>{user.name}</h1>
      <PostList posts={posts} />
    </div>
  );
}
```

---

## 12. Lifecycle Flow Diagrams

### Class Component Lifecycle

```
MOUNTING
────────────────────────────────────────────────────────────
  constructor(props)
       ↓
  static getDerivedStateFromProps(props, state)
       ↓
  render()
       ↓
  [React updates DOM]
       ↓
  componentDidMount()   ← Side effects, API calls, subscriptions

UPDATING (triggered by setState / new props / forceUpdate)
────────────────────────────────────────────────────────────
  static getDerivedStateFromProps(props, state)
       ↓
  shouldComponentUpdate(nextProps, nextState)
       ↓ (returns true)
  render()
       ↓
  getSnapshotBeforeUpdate(prevProps, prevState)
       ↓
  [React updates DOM]
       ↓
  componentDidUpdate(prevProps, prevState, snapshot)

UNMOUNTING
────────────────────────────────────────────────────────────
  componentWillUnmount()   ← Cleanup

ERROR HANDLING
────────────────────────────────────────────────────────────
  static getDerivedStateFromError(error)   ← Update state
  componentDidCatch(error, info)           ← Log error
```

### Functional Component Lifecycle (useEffect)

```
MOUNT
──────────────────────────────────────────
  Component function runs
       ↓
  JSX returned → React updates DOM
       ↓
  useLayoutEffect(() => {...}, [])   ← synchronous, before paint
       ↓
  [Browser paints screen]
       ↓
  useEffect(() => {...}, [])         ← async, after paint

UPDATE (state/prop change)
──────────────────────────────────────────
  Component function re-runs
       ↓
  JSX returned → React updates DOM
       ↓
  Previous useLayoutEffect cleanup runs
       ↓
  useLayoutEffect runs again
       ↓
  [Browser paints]
       ↓
  Previous useEffect cleanup runs
       ↓
  useEffect runs again

UNMOUNT
──────────────────────────────────────────
  useLayoutEffect cleanup runs
       ↓
  useEffect cleanup runs
       ↓
  Component removed from DOM
```

---

## 13. Common Patterns & Use Cases

### Pattern 1: Data Fetching on Mount

```jsx
// Functional — recommended
function ArticlePage({ articleId }) {
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();

    fetch(`/api/articles/${articleId}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => { setArticle(data); setLoading(false); })
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); setLoading(false); });

    return () => controller.abort();
  }, [articleId]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;
  return article ? <Article data={article} /> : null;
}
```

---

### Pattern 2: Real-time Subscriptions

```jsx
function LiveScore({ matchId }) {
  const [score, setScore] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(`wss://api.sports.io/match/${matchId}`);

    socket.onopen = () => console.log('Connected');
    socket.onmessage = (e) => setScore(JSON.parse(e.data));
    socket.onerror = (e) => console.error('Socket error', e);

    return () => {
      socket.close();
    };
  }, [matchId]); // Reconnect when matchId changes

  return <ScoreBoard score={score} />;
}
```

---

### Pattern 3: Debounced Search

```jsx
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Debounce — don't search on every keystroke
    const timer = setTimeout(async () => {
      const data = await fetch(`/api/search?q=${query}`).then(r => r.json());
      setResults(data);
    }, 400);

    return () => clearTimeout(timer); // Cancel on next keystroke
  }, [query]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ResultsList results={results} />
    </div>
  );
}
```

---

### Pattern 4: Syncing with External Store

```jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
```

---

### Pattern 5: Document Title

```jsx
function useDocumentTitle(title) {
  const prevTitleRef = useRef(document.title);

  useEffect(() => {
    document.title = title;

    return () => {
      document.title = prevTitleRef.current; // Restore on unmount
    };
  }, [title]);
}

// Usage
function ProductPage({ product }) {
  useDocumentTitle(`${product.name} — My Shop`);
  return <div>...</div>;
}
```

---

### Pattern 6: Previous Value

```jsx
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value; // Update AFTER render
  }, [value]);

  return ref.current; // Returns previous value
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <p>
      Now: {count}, Before: {prevCount}
    </p>
  );
}
```

---

## 14. Common Mistakes & Pitfalls

### Mistake 1: Missing Cleanup

```jsx
// ❌ Memory leak — event listener never removed
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
}, []);

// ✅ Always return cleanup
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

### Mistake 2: Missing Dependencies

```jsx
// ❌ ESLint warning — userId is used but not listed
useEffect(() => {
  fetchUser(userId); // userId might be stale!
}, []);

// ✅ Include all used values
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

---

### Mistake 3: Infinite Loop

```jsx
// ❌ Infinite loop — object created each render triggers effect, which triggers render
const options = { page: 1 }; // New reference every render!
useEffect(() => {
  fetchData(options);
}, [options]); // options changes every render

// ✅ Fix 1 — primitive values
useEffect(() => {
  fetchData({ page });
}, [page]);

// ✅ Fix 2 — useMemo for objects
const options = useMemo(() => ({ page }), [page]);
useEffect(() => {
  fetchData(options);
}, [options]);
```

---

### Mistake 4: setState After Unmount

```jsx
// ❌ Warning — component may unmount before fetch completes
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData); // setData after unmount!
}, []);

// ✅ Fix — use isMounted flag or AbortController
useEffect(() => {
  let mounted = true;
  fetch('/api/data')
    .then(r => r.json())
    .then(data => { if (mounted) setData(data); });
  return () => { mounted = false; };
}, []);
```

---

### Mistake 5: Using useEffect for Derived State

```jsx
// ❌ Unnecessary effect — derived values shouldn't use effects
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Just compute it during render
const fullName = `${firstName} ${lastName}`; // No effect needed!
```

---

## 15. Interview Questions & Answers

### Q1. What is the order of lifecycle methods when a class component mounts?
**Answer:** `constructor` → `getDerivedStateFromProps` → `render` → `componentDidMount`

---

### Q2. When does `componentDidUpdate` NOT get called?
**Answer:** `componentDidUpdate` is not called after the **initial render** (mount). It's only called on subsequent re-renders.

---

### Q3. How do you replicate `componentDidMount` in a functional component?
**Answer:** Use `useEffect` with an empty dependency array:
```jsx
useEffect(() => {
  // Equivalent to componentDidMount
}, []);
```

---

### Q4. What happens if you call `setState` inside `componentDidMount`?
**Answer:** React batches the update and triggers a second render, but this second render happens before the browser updates the screen — so the user never sees the intermediate state. However, this causes extra work, so only do it when necessary (e.g., after measuring the DOM).

---

### Q5. What is the difference between `useEffect` and `useLayoutEffect`?
**Answer:**
- `useEffect` runs **asynchronously after** the browser has painted.
- `useLayoutEffect` runs **synchronously after** DOM mutations but **before** the browser paints.

Use `useLayoutEffect` when you need to read DOM layout and synchronously re-render to avoid visual flicker (e.g., tooltip positioning).

---

### Q6. How do you run an effect only once on mount?
**Answer:** Pass an empty array `[]` as the dependency array:
```jsx
useEffect(() => {
  // Only runs on mount
}, []);
```

---

### Q7. How do you run cleanup code when a component unmounts?
**Answer:** Return a function from `useEffect`:
```jsx
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe(); // Cleanup on unmount
}, []);
```

---

### Q8. What problem does `getDerivedStateFromProps` solve and when should you use it?
**Answer:** It allows a component to update its internal state in response to a change in props. It should rarely be used — most cases are better handled with controlled components or memoization. A common valid use case: resetting input state when a `key` prop changes.

---

### Q9. Why is `getSnapshotBeforeUpdate` useful? Give an example.
**Answer:** It captures DOM information (like scroll position) right before the DOM is updated. This value is then passed to `componentDidUpdate`. Classic use case: maintaining scroll position in a chat window when new messages are added.

---

### Q10. Can you use hooks inside class components?
**Answer:** No. Hooks can only be used inside functional components or other custom hooks. Class components use lifecycle methods instead.

---

### Q11. What causes the cleanup function of `useEffect` to run?
**Answer:** The cleanup function runs in two scenarios:
1. When the component is **unmounted**.
2. **Before the effect runs again** (when a dependency changes) — React cleans up the previous effect before running the new one.

---

### Q12. What is the functional component equivalent of `shouldComponentUpdate`?
**Answer:** `React.memo` for component-level memoization. For finer control, pass a custom comparison function as the second argument to `React.memo`.

---

### Q13. Is there a hook equivalent for `getDerivedStateFromError` and `componentDidCatch`?
**Answer:** No. Error boundaries can only be implemented using class components. However, you can use libraries like `react-error-boundary` which wrap the class-based API in a more convenient functional interface.

---

### Q14. What is the execution order when both `useEffect` and `useLayoutEffect` are present?
**Answer:**
1. Render (component function runs)
2. DOM updates
3. `useLayoutEffect` runs (synchronous)
4. Browser paints
5. `useEffect` runs (asynchronous)

---

### Q15. How do you prevent an infinite loop in `useEffect`?
**Answer:**
- Don't put state variables in deps if updating them in the effect (use functional setState instead).
- Memoize objects/arrays with `useMemo` before using them as dependencies.
- Use primitive values as dependencies instead of objects.
- Use `useCallback` for function dependencies.

---

*End of React Lifecycle Methods Guide*