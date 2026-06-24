# React Interview Questions & Answers

> A comprehensive, topic-wise collection of React interview questions and answers — from fundamentals to advanced patterns.

---

## Table of Contents

1. [React Fundamentals](#1-react-fundamentals)
2. [JSX](#2-jsx)
3. [Components](#3-components)
4. [Props](#4-props)
5. [State](#5-state)
6. [Lifecycle Methods](#6-lifecycle-methods)
7. [Hooks](#7-hooks)
8. [Event Handling](#8-event-handling)
9. [Conditional Rendering](#9-conditional-rendering)
10. [Lists and Keys](#10-lists-and-keys)
11. [Forms and Controlled Components](#11-forms-and-controlled-components)
12. [Refs](#12-refs)
13. [Context API](#13-context-api)
14. [Higher-Order Components (HOC)](#14-higher-order-components-hoc)
15. [Render Props](#15-render-props)
16. [Code Splitting & Lazy Loading](#16-code-splitting--lazy-loading)
17. [Performance Optimization](#17-performance-optimization)
18. [React Router](#18-react-router)
19. [State Management (Redux / Zustand)](#19-state-management-redux--zustand)
20. [Error Boundaries](#20-error-boundaries)
21. [Portals](#21-portals)
22. [Fragments](#22-fragments)
23. [Testing in React](#23-testing-in-react)
24. [React Internals & Virtual DOM](#24-react-internals--virtual-dom)
25. [TypeScript with React](#25-typescript-with-react)
26. [Security in React](#26-security-in-react)
27. [Advanced Patterns](#27-advanced-patterns)
28. [React 18 & Concurrent Features](#28-react-18--concurrent-features)

---

## 1. React Fundamentals

### Q1. What is React?
**Answer:**
React is an open-source JavaScript library developed by Facebook for building user interfaces, particularly single-page applications. It follows a component-based architecture where the UI is broken into reusable, independent pieces called components.

Key characteristics:
- **Declarative**: You describe what the UI should look like, and React handles the rendering.
- **Component-Based**: UI is built from encapsulated components managing their own state.
- **Virtual DOM**: React maintains a lightweight representation of the real DOM for efficient updates.
- **Unidirectional Data Flow**: Data flows from parent to child via props.

---

### Q2. What are the key features of React?
**Answer:**

| Feature | Description |
|---|---|
| Virtual DOM | Efficient diffing and updating of the real DOM |
| JSX | Syntax extension that lets you write HTML-like code in JS |
| Components | Reusable, isolated UI pieces |
| One-way Data Binding | Data flows top-down, making apps predictable |
| React Hooks | Allow state and lifecycle in functional components |
| React Fiber | Reimplemented reconciliation engine for async rendering |

---

### Q3. What is the difference between React and ReactDOM?
**Answer:**
- **React**: The core library containing the logic for creating components, managing state, and the reconciliation algorithm.
- **ReactDOM**: The package that provides DOM-specific methods, enabling React to interact with the browser DOM.

```js
import React from 'react';       // Core library
import ReactDOM from 'react-dom'; // DOM bindings

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

---

### Q4. What is the Virtual DOM? How does it work?
**Answer:**
The Virtual DOM (VDOM) is an in-memory, lightweight JavaScript representation of the real DOM.

**How it works:**
1. When state/props change, React re-renders the component into a new Virtual DOM tree.
2. React compares the new VDOM with the previous one — this is called **diffing**.
3. React calculates the minimum number of changes needed (reconciliation).
4. Only the changed parts are updated in the real DOM (**patching**).

This avoids expensive direct DOM manipulations and improves performance.

---

### Q5. What is the difference between Real DOM and Virtual DOM?

| Real DOM | Virtual DOM |
|---|---|
| Directly represents browser UI | In-memory JS object representation |
| Slow to update | Fast to update |
| Re-renders the entire tree on change | Only re-renders changed nodes |
| Expensive DOM operations | Batch updates and minimal patches |

---

### Q6. What is reconciliation in React?
**Answer:**
Reconciliation is the process by which React updates the DOM. When a component re-renders, React compares the new VDOM tree with the previous one using a **diffing algorithm**.

React's diffing rules:
- Elements of **different types** produce different trees (old tree is torn down).
- Elements of the **same type** update only changed attributes.
- For lists, React uses **keys** to identify which items changed, were added, or removed.

---

### Q7. What is React Fiber?
**Answer:**
React Fiber is the reimplementation of React's core reconciliation algorithm (introduced in React 16). It enables:
- **Incremental rendering**: Splitting rendering work into chunks over multiple frames.
- **Prioritization**: Assigning priority to updates (e.g., user interactions have higher priority).
- **Pausing, aborting, or reusing work**: React can pause a render, work on a higher-priority update, and return.
- **Concurrency**: Foundation for Concurrent Mode features in React 18.

---

### Q8. What is the difference between a library and a framework? Is React a library or framework?
**Answer:**
- **Library**: A collection of tools/functions you call in your code. You control the flow.
- **Framework**: A complete structure that controls the flow; you fill in the blanks.

React is a **library** — it handles only the View layer. You choose your own routing (React Router), state management (Redux/Zustand), etc. Frameworks like Angular provide all of this out of the box.

---

## 2. JSX

### Q9. What is JSX?
**Answer:**
JSX (JavaScript XML) is a syntax extension for JavaScript that looks like HTML and is used with React to describe what the UI should look like. JSX is not valid JavaScript — it gets compiled by Babel into `React.createElement()` calls.

```jsx
// JSX
const element = <h1 className="title">Hello, World!</h1>;

// Compiled to:
const element = React.createElement('h1', { className: 'title' }, 'Hello, World!');
```

---

### Q10. Why can't browsers read JSX directly?
**Answer:**
Browsers only understand plain JavaScript. JSX is a syntactic sugar that needs to be transpiled to `React.createElement()` calls. This is done by tools like **Babel** during the build step.

---

### Q11. What are the rules of JSX?
**Answer:**
1. **Return a single root element** — wrap multiple elements in a parent or `<>...</>` (Fragment).
2. **Close all tags** — `<img />`, `<br />` are required (unlike HTML).
3. **Use `className` instead of `class`**.
4. **Use `camelCase` for attribute names** — `onClick`, `onChange`, `htmlFor`.
5. **JavaScript expressions** must be wrapped in curly braces `{}`.
6. **Comments** inside JSX use `{/* comment */}`.

---

### Q12. What is the difference between JSX expressions and JSX statements?
**Answer:**
- **JSX expressions** are embedded JS values (strings, variables, function calls): `{name}`, `{getGreeting()}`
- You **cannot** use JS statements directly in JSX (like `if`, `for`, `switch`).
- Use **ternary operators** or **logical `&&`** for conditional rendering inside JSX.

```jsx
// ✅ Expression
{isLoggedIn ? <Dashboard /> : <Login />}

// ✅ Logical AND
{isAdmin && <AdminPanel />}

// ❌ Statement (invalid inside JSX)
{if (isLoggedIn) { return <Dashboard />; }}
```

---

### Q13. Can you write React without JSX?
**Answer:**
Yes. JSX is optional. You can use `React.createElement()` directly:

```js
// With JSX
const element = <h1 className="greeting">Hello</h1>;

// Without JSX
const element = React.createElement('h1', { className: 'greeting' }, 'Hello');
```

JSX simply provides a more readable syntax.

---

## 3. Components

### Q14. What are components in React?
**Answer:**
Components are the building blocks of a React application. They are reusable, independent pieces of UI that can accept inputs (props) and return React elements describing what should appear on the screen.

There are two types:
- **Functional Components** (preferred)
- **Class Components**

---

### Q15. What is the difference between functional and class components?

| Feature | Functional Component | Class Component |
|---|---|---|
| Syntax | Plain JavaScript function | ES6 class extending `React.Component` |
| State | Via `useState` hook | `this.state` |
| Lifecycle | Via `useEffect` hook | Lifecycle methods |
| `this` keyword | Not needed | Required |
| Performance | Slightly better | Slightly more overhead |
| Boilerplate | Less | More |

```jsx
// Functional
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Class
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}
```

---

### Q16. What is a Pure Component?
**Answer:**
A Pure Component is a class component that implements `shouldComponentUpdate()` with a **shallow comparison** of props and state. If neither has changed, it skips re-rendering.

```jsx
class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.value}</div>;
  }
}
```

The functional equivalent is `React.memo()`.

---

### Q17. What is the difference between `React.Component` and `React.PureComponent`?
**Answer:**
- `React.Component` re-renders every time `setState` is called or parent re-renders.
- `React.PureComponent` performs a shallow comparison of props and state before re-rendering. If they are the same, it skips the render, improving performance.

**Caveat**: Shallow comparison only checks reference equality, not deep equality. Mutating objects without creating new references won't trigger re-renders.

---

### Q18. What is a Stateless vs Stateful component?
**Answer:**
- **Stateless (Presentational/Dumb)**: Only renders UI based on props; no internal state.
- **Stateful (Container/Smart)**: Manages its own internal state and may contain business logic.

```jsx
// Stateless
const Button = ({ label, onClick }) => <button onClick={onClick}>{label}</button>;

// Stateful
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

---

### Q19. What is a controlled vs uncontrolled component?
**Answer:**
- **Controlled Component**: Form element value is controlled by React state. The component is the "single source of truth."
- **Uncontrolled Component**: Form element manages its own state internally via the DOM. You access the value using a `ref`.

```jsx
// Controlled
const [value, setValue] = useState('');
<input value={value} onChange={e => setValue(e.target.value)} />

// Uncontrolled
const inputRef = useRef();
<input ref={inputRef} />
// Access: inputRef.current.value
```

---

## 4. Props

### Q20. What are props in React?
**Answer:**
Props (short for "properties") are read-only inputs passed from a parent component to a child component. They are the mechanism for component communication and data flow in React.

```jsx
function Welcome({ name, age }) {
  return <p>{name} is {age} years old.</p>;
}

<Welcome name="Alice" age={25} />
```

---

### Q21. What is prop drilling? How do you avoid it?
**Answer:**
Prop drilling occurs when you pass props through many layers of components that don't need the data — just to get it to a deeply nested component.

**Solutions:**
- **React Context API**: Share data across the component tree without explicit prop passing.
- **State management libraries**: Redux, Zustand, Jotai.
- **Component Composition**: Lifting state or restructuring components.

---

### Q22. What are default props?
**Answer:**
Default props define fallback values for props that are not explicitly provided.

```jsx
// Functional (ES6 default parameters)
function Greeting({ name = 'Guest' }) {
  return <h1>Hello, {name}!</h1>;
}

// Or using defaultProps (legacy)
Greeting.defaultProps = { name: 'Guest' };
```

---

### Q23. What is prop types? How do you use it?
**Answer:**
`PropTypes` is a runtime type-checking library for React props. It warns in development if props don't match expected types.

```jsx
import PropTypes from 'prop-types';

function UserCard({ name, age, isAdmin }) {
  return <div>{name} - {age}</div>;
}

UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
  isAdmin: PropTypes.bool,
};
```

**Note**: For TypeScript projects, TypeScript interfaces/types are preferred over PropTypes.

---

### Q24. What is the difference between `props.children` and passing explicit props?
**Answer:**
- **Explicit props**: Named data passed to a component `<Card title="Hello" />`.
- **`props.children`**: The content nested between opening and closing tags of a component.

```jsx
function Card({ title, children }) {
  return (
    <div>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

<Card title="News">
  <p>This is the card body.</p>  {/* This becomes children */}
</Card>
```

---

### Q25. Can you pass functions as props?
**Answer:**
Yes. Functions are values in JavaScript and can be passed as props — commonly used for callbacks (child-to-parent communication).

```jsx
function Parent() {
  const handleClick = (msg) => alert(msg);
  return <Child onAction={handleClick} />;
}

function Child({ onAction }) {
  return <button onClick={() => onAction('Hello from Child!')}>Click</button>;
}
```

---

## 5. State

### Q26. What is state in React?
**Answer:**
State is a built-in object that stores data that may change over the lifetime of a component. When state changes, React re-renders the component to reflect the updated UI.

```jsx
const [count, setCount] = useState(0);
```

---

### Q27. What is the difference between props and state?

| Feature | Props | State |
|---|---|---|
| Passed from | Parent component | Within the component itself |
| Mutability | Immutable (read-only) | Mutable (via setter) |
| Triggers re-render | Yes (when parent re-renders) | Yes (when updated) |
| Ownership | Parent owns | Component owns |

---

### Q28. How do you update state correctly in React?
**Answer:**
Always use the setter function returned by `useState`, never mutate state directly. When the new state depends on the old state, use the **functional update form**:

```jsx
// ❌ Wrong — direct mutation
state.count = 5;

// ✅ Correct — using setter
setCount(5);

// ✅ Correct — functional update (when depending on previous state)
setCount(prevCount => prevCount + 1);
```

---

### Q29. What is the difference between `setState` (class) and `useState` (functional)?
**Answer:**
- `setState` in class components **merges** the new state with the existing state.
- `useState` setter **replaces** the state with the new value (it does not merge).

```jsx
// Class setState - merges
this.setState({ name: 'Alice' }); // keeps other keys intact

// useState - replaces the whole state
setState({ name: 'Alice' }); // if state was { name: '', age: 0 }, age is now gone!
// Correct approach:
setState(prev => ({ ...prev, name: 'Alice' }));
```

---

### Q30. What is lifting state up?
**Answer:**
When multiple sibling components need to share state, you "lift the state up" to their closest common ancestor. The parent manages the state and passes it down as props.

```jsx
function Parent() {
  const [value, setValue] = useState('');
  return (
    <>
      <InputComponent value={value} onChange={setValue} />
      <DisplayComponent value={value} />
    </>
  );
}
```

---

### Q31. What is the difference between local state, global state, server state, and URL state?
**Answer:**
- **Local state**: Exists only within a single component (`useState`).
- **Global state**: Shared across many components (Context, Redux, Zustand).
- **Server state**: Asynchronous data from an API (React Query, SWR).
- **URL state**: State stored in the URL (query params, path) managed via routing.

---

## 6. Lifecycle Methods

### Q32. What are the lifecycle phases of a React component?
**Answer:**
A React class component goes through three phases:

1. **Mounting** — component is created and added to the DOM.
2. **Updating** — component re-renders due to state/props change.
3. **Unmounting** — component is removed from the DOM.

---

### Q33. What are the main lifecycle methods in React class components?
**Answer:**

**Mounting:**
- `constructor()` — Initialize state and bind methods.
- `static getDerivedStateFromProps()` — Sync state with props before render.
- `render()` — Returns JSX.
- `componentDidMount()` — Run after first render (API calls, subscriptions).

**Updating:**
- `static getDerivedStateFromProps()` — Before each render.
- `shouldComponentUpdate()` — Return false to skip re-render.
- `render()` — Re-renders JSX.
- `getSnapshotBeforeUpdate()` — Capture DOM state before update.
- `componentDidUpdate()` — Run after every update.

**Unmounting:**
- `componentWillUnmount()` — Cleanup (remove listeners, cancel requests).

---

### Q34. What is `componentDidMount` used for?
**Answer:**
`componentDidMount` is called once after the component is first rendered and added to the DOM. It is the ideal place for:
- Fetching data from an API
- Setting up subscriptions or event listeners
- Directly manipulating the DOM

---

### Q35. What is `componentWillUnmount` used for?
**Answer:**
`componentWillUnmount` is the cleanup phase. It is called just before the component is removed from the DOM. Use it to:
- Clear timers (`clearTimeout`, `clearInterval`)
- Cancel network requests
- Remove event listeners
- Unsubscribe from subscriptions

---

## 7. Hooks

### Q36. What are React Hooks?
**Answer:**
Hooks are functions introduced in React 16.8 that allow functional components to use React features like state and lifecycle methods. They enable writing cleaner, reusable logic without class components.

**Rules of Hooks:**
1. Only call hooks at the **top level** (not inside loops, conditions, or nested functions).
2. Only call hooks inside **React functional components** or **custom hooks**.

---

### Q37. What is `useState`?
**Answer:**
`useState` is a hook that adds state to functional components.

```jsx
const [state, setState] = useState(initialValue);
```

- `state` — the current state value.
- `setState` — function to update the state.
- `initialValue` — initial value (can be any type; pass a function for lazy initialization).

```jsx
// Lazy initialization (runs only once)
const [count, setCount] = useState(() => expensiveComputation());
```

---

### Q38. What is `useEffect`?
**Answer:**
`useEffect` handles side effects in functional components — data fetching, subscriptions, manual DOM changes, etc.

```jsx
useEffect(() => {
  // Side effect code
  return () => {
    // Cleanup (equivalent to componentWillUnmount)
  };
}, [dependencies]);
```

**Dependency array behavior:**
- `[]` — Runs once after initial render (like `componentDidMount`).
- `[dep1, dep2]` — Runs when any listed dependency changes.
- No array — Runs after every render.

---

### Q39. What is `useContext`?
**Answer:**
`useContext` consumes a React Context value inside a functional component, avoiding prop drilling.

```jsx
const ThemeContext = React.createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}
```

---

### Q40. What is `useRef`?
**Answer:**
`useRef` creates a mutable ref object whose `.current` property persists across renders without causing re-renders.

**Uses:**
1. Accessing DOM elements directly.
2. Storing mutable values that don't require re-render.

```jsx
const inputRef = useRef(null);

// Focus input on button click
const handleFocus = () => inputRef.current.focus();

<input ref={inputRef} />
<button onClick={handleFocus}>Focus</button>
```

---

### Q41. What is `useReducer`?
**Answer:**
`useReducer` is an alternative to `useState` for managing complex state logic with multiple sub-values or when the next state depends on the previous one.

```jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    default: throw new Error('Unknown action');
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}
```

---

### Q42. What is `useMemo`?
**Answer:**
`useMemo` memoizes the result of an expensive computation and only recomputes it when dependencies change.

```jsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

**Use when**: A computation is expensive and its inputs don't change often.

---

### Q43. What is `useCallback`?
**Answer:**
`useCallback` memoizes a function so it's not recreated on every render — useful when passing callbacks to child components wrapped in `React.memo`.

```jsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

---

### Q44. What is the difference between `useMemo` and `useCallback`?

| Hook | Returns | Use case |
|---|---|---|
| `useMemo` | Memoized **value** | Expensive calculations |
| `useCallback` | Memoized **function** | Stable callbacks for child components |

```jsx
// useMemo — caches the result
const result = useMemo(() => compute(x), [x]);

// useCallback — caches the function
const fn = useCallback(() => compute(x), [x]);
```

---

### Q45. What is `useLayoutEffect`?
**Answer:**
`useLayoutEffect` is identical to `useEffect`, but fires synchronously **after DOM mutations** and **before the browser paints**. Use it when you need to read layout from the DOM and synchronously re-render.

```jsx
useLayoutEffect(() => {
  // Runs after DOM update but before paint
  const { height } = element.getBoundingClientRect();
  setHeight(height);
}, []);
```

**Use `useEffect` by default**; switch to `useLayoutEffect` only when you observe visual flickering.

---

### Q46. What are custom hooks?
**Answer:**
Custom hooks are JavaScript functions that start with `use` and can call other hooks. They let you extract and reuse stateful logic across components.

```jsx
// Custom hook
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// Usage
const { data, loading } = useFetch('/api/users');
```

---

### Q47. What is `useImperativeHandle`?
**Answer:**
`useImperativeHandle` customizes the instance value (ref) that is exposed to a parent component when using `forwardRef`. It allows you to expose only specific methods.

```jsx
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; }
  }));

  return <input ref={inputRef} />;
});

// Parent
const ref = useRef();
ref.current.focus(); // Only exposes focus and clear
```

---

### Q48. What is `useDebugValue`?
**Answer:**
`useDebugValue` is used inside custom hooks to display a label in React DevTools. It's only for debugging.

```jsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useDebugValue(isOnline ? 'Online' : 'Offline');
  return isOnline;
}
```

---

### Q49. What is `useId`? (React 18)
**Answer:**
`useId` generates a stable, unique ID that is consistent between server and client rendering. Useful for accessibility attributes like `htmlFor` and `aria-describedby`.

```jsx
function PasswordField() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Password</label>
      <input id={id} type="password" />
    </>
  );
}
```

---

## 8. Event Handling

### Q50. How does event handling work in React?
**Answer:**
React uses **Synthetic Events** — a cross-browser wrapper around the browser's native events. Event names are camelCase and handlers are functions, not strings.

```jsx
// HTML
<button onclick="handleClick()">Click</button>

// React
<button onClick={handleClick}>Click</button>
```

---

### Q51. What is event delegation in React?
**Answer:**
Rather than attaching event listeners to each individual DOM node, React attaches a **single event listener to the root** of the application and delegates events from there. This improves performance by reducing the number of listeners.

---

### Q52. How do you prevent default behavior and stop propagation in React?
**Answer:**

```jsx
function handleSubmit(e) {
  e.preventDefault();    // Prevents default form submission
  e.stopPropagation();   // Prevents event from bubbling up
}

<form onSubmit={handleSubmit}>...</form>
```

---

### Q53. What is the difference between `onClick={handleClick}` and `onClick={() => handleClick()}`?
**Answer:**
- `onClick={handleClick}` — passes a reference to the function. Called with the event object.
- `onClick={() => handleClick()}` — creates a new arrow function on every render (performance concern), but allows passing custom arguments.

```jsx
// Pass arguments with arrow function
<button onClick={() => handleClick(item.id)}>Delete</button>
```

---

## 9. Conditional Rendering

### Q54. What are the different ways to conditionally render in React?
**Answer:**

**1. `if` / `else` statement (outside JSX):**
```jsx
if (isLoggedIn) return <Dashboard />;
return <Login />;
```

**2. Ternary operator:**
```jsx
{isLoggedIn ? <Dashboard /> : <Login />}
```

**3. Logical `&&`:**
```jsx
{isAdmin && <AdminPanel />}
```

**4. `||` (fallback):**
```jsx
{user.name || 'Anonymous'}
```

**5. IIFE:**
```jsx
{(() => {
  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <Error />;
  return <Data />;
})()}
```

---

### Q55. What is the danger of using `&&` for conditional rendering?
**Answer:**
If the left operand is `0` (a falsy number), React will render `0` instead of nothing.

```jsx
// ❌ Bug — renders "0" when count is 0
{count && <List items={items} />}

// ✅ Fix — use explicit boolean
{count > 0 && <List items={items} />}

// ✅ Fix — use ternary
{count ? <List items={items} /> : null}
```

---

## 10. Lists and Keys

### Q56. How do you render a list of items in React?
**Answer:**
Use `Array.map()` to iterate and return JSX elements. Each element must have a unique `key` prop.

```jsx
const users = ['Alice', 'Bob', 'Charlie'];

function UserList() {
  return (
    <ul>
      {users.map((user, index) => (
        <li key={user}>{user}</li>
      ))}
    </ul>
  );
}
```

---

### Q57. What are keys in React? Why are they important?
**Answer:**
Keys are special string attributes that help React identify which items in a list have changed, been added, or removed. Keys enable efficient reconciliation.

**Rules for keys:**
- Must be **unique among siblings** (not globally).
- Should be **stable** — don't use array indices if the list can reorder.
- Don't use random values (like `Math.random()`).

```jsx
// ✅ Good — using unique ID
items.map(item => <Item key={item.id} data={item} />)

// ⚠️ Avoid — index as key (causes bugs on reorder/delete)
items.map((item, i) => <Item key={i} data={item} />)
```

---

### Q58. When is it acceptable to use index as a key?
**Answer:**
Using the index as a key is acceptable only when:
1. The list is **static** and will never reorder or filter.
2. Items have **no stable unique ID**.
3. The list is **never re-sorted**.

In all other cases, use a unique stable identifier.

---

## 11. Forms and Controlled Components

### Q59. How do you handle form submission in React?
**Answer:**

```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

### Q60. What is the difference between `onChange` and `onInput` in React?
**Answer:**
In React, `onChange` fires on every keystroke (unlike native HTML where it fires on blur). It is effectively the same as the native `oninput` event. React normalizes this behavior across browsers.

---

### Q61. How do you handle multiple form inputs with one handler?
**Answer:**
Use a single state object and use the `name` attribute to identify which field to update:

```jsx
const [formData, setFormData] = useState({ name: '', email: '' });

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

<input name="name" value={formData.name} onChange={handleChange} />
<input name="email" value={formData.email} onChange={handleChange} />
```

---

### Q62. What are popular form libraries for React?
**Answer:**
- **React Hook Form** — Performant, minimal re-renders, native form validation.
- **Formik** — Full-featured form management.
- **Zod / Yup** — Schema-based validation (used with above libraries).

---

## 12. Refs

### Q63. What are refs in React?
**Answer:**
Refs provide a way to access DOM nodes or React elements directly. They are useful for:
- Managing focus, text selection, or media playback.
- Triggering imperative animations.
- Integrating with third-party DOM libraries.

---

### Q64. What is `forwardRef`?
**Answer:**
`forwardRef` lets a component pass a `ref` it receives from its parent down to a child DOM element.

```jsx
const Input = forwardRef((props, ref) => (
  <input ref={ref} {...props} />
));

// Parent
const inputRef = useRef();
<Input ref={inputRef} />
inputRef.current.focus();
```

---

### Q65. What is the difference between `useRef` and `createRef`?
**Answer:**
- `useRef` — Used in functional components. Returns the **same ref object** on every render.
- `createRef` — Used in class components (or functional, but creates a **new ref on every render**).

```jsx
// useRef — persists across renders
const ref = useRef(null); // Always the same ref

// createRef — new ref every time (avoid in functional components)
const ref = createRef(); // New ref on every render
```

---

## 13. Context API

### Q66. What is the Context API?
**Answer:**
The Context API provides a way to share data (like theme, user info, locale) across the component tree without prop drilling.

```jsx
// 1. Create context
const ThemeContext = createContext('light');

// 2. Provide value
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// 3. Consume
const theme = useContext(ThemeContext);
```

---

### Q67. When should you use Context vs Redux?
**Answer:**

| Scenario | Use Context | Use Redux |
|---|---|---|
| Passing theme/locale globally | ✅ | Overkill |
| Complex state with many updates | ❌ (performance) | ✅ |
| Debugging / time-travel | ❌ | ✅ (DevTools) |
| Server cache / async data | ❌ | With RTK Query |
| Small to medium apps | ✅ | Optional |

---

### Q68. What are the limitations of Context API?
**Answer:**
- **Performance**: Every consumer re-renders when the context value changes, even if only a part of the value changed.
- **No built-in optimization**: Unlike Redux, there's no selector mechanism out of the box.
- **Not meant for high-frequency updates**: Using context for frequently changing values (like mouse position) causes performance issues.

**Solutions**: Split contexts, use `useMemo` for context values, or use Zustand/Jotai for fine-grained subscriptions.

---

## 14. Higher-Order Components (HOC)

### Q69. What is a Higher-Order Component (HOC)?
**Answer:**
A Higher-Order Component is a function that takes a component and returns a new enhanced component. It's a pattern for reusing component logic.

```jsx
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const isAuthenticated = useAuth();
    if (!isAuthenticated) return <Redirect to="/login" />;
    return <WrappedComponent {...props} />;
  };
}

const ProtectedDashboard = withAuth(Dashboard);
```

---

### Q70. What are the use cases of HOCs?
**Answer:**
- Authentication and authorization guards
- Logging and analytics
- Theming
- Loading state wrappers
- Feature flags

---

### Q71. What are the drawbacks of HOCs?
**Answer:**
- **Wrapper hell**: Multiple HOCs create deeply nested component trees.
- **Prop collision**: HOC-injected props may collide with component props.
- **Debugging difficulty**: Wrapped components can be hard to trace in DevTools.

**Modern alternatives**: Hooks and render props solve most HOC use cases with less complexity.

---

## 15. Render Props

### Q72. What is the Render Props pattern?
**Answer:**
Render Props is a pattern where a component shares its logic with other components by passing a function as a prop, which returns JSX.

```jsx
function MouseTracker({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>
      {render(pos)}
    </div>
  );
}

// Usage
<MouseTracker render={({ x, y }) => <p>Mouse: {x}, {y}</p>} />
```

---

### Q73. What is the difference between HOC and Render Props?
**Answer:**

| Aspect | HOC | Render Props |
|---|---|---|
| Pattern | Wraps component in function | Passes function as prop |
| Logic reuse | Static, at import time | Dynamic, at render time |
| Flexibility | Less flexible | More flexible |
| Modern preference | Replaced by hooks | Replaced by hooks |

Both are older patterns largely replaced by custom hooks in modern React.

---

## 16. Code Splitting & Lazy Loading

### Q74. What is code splitting in React?
**Answer:**
Code splitting breaks your app bundle into smaller chunks loaded on demand, improving initial load performance.

React supports it via `React.lazy()` and dynamic `import()`.

```jsx
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyComponent />
    </Suspense>
  );
}
```

---

### Q75. What is `React.lazy` and `Suspense`?
**Answer:**
- `React.lazy()` — dynamically imports a component. Returns a React component that loads lazily.
- `Suspense` — wraps lazy-loaded components and shows a fallback UI while they load.

```jsx
const Settings = React.lazy(() => import('./Settings'));

<Suspense fallback={<div>Loading...</div>}>
  <Settings />
</Suspense>
```

**Note**: `React.lazy` only works with default exports.

---

### Q76. What is route-based code splitting?
**Answer:**
The most effective place to split code is at route boundaries — each page is loaded only when navigated to.

```jsx
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

<Routes>
  <Route path="/" element={<Suspense fallback={<Loading />}><Home /></Suspense>} />
  <Route path="/about" element={<Suspense fallback={<Loading />}><About /></Suspense>} />
</Routes>
```

---

## 17. Performance Optimization

### Q77. What are common React performance optimization techniques?
**Answer:**

1. **`React.memo`** — Prevents re-rendering if props haven't changed.
2. **`useMemo`** — Memoize expensive computations.
3. **`useCallback`** — Memoize event handler functions.
4. **Code Splitting** — Lazy load routes and heavy components.
5. **Virtualization** — Only render visible list items (`react-window`, `react-virtual`).
6. **Avoid anonymous functions in JSX** — They create new references on every render.
7. **Key-based reconciliation** — Use stable keys for lists.
8. **Avoid unnecessary state** — Derive values when possible instead of storing them.
9. **Batch state updates** — React 18 auto-batches updates.
10. **Profiler** — Use React DevTools Profiler to identify bottlenecks.

---

### Q78. What is `React.memo`?
**Answer:**
`React.memo` is a HOC that wraps a functional component and memoizes the rendered output. It prevents re-rendering if the props haven't changed (shallow comparison).

```jsx
const MyComponent = React.memo(function MyComponent({ value }) {
  return <div>{value}</div>;
});
```

For custom comparison:
```jsx
const MyComponent = React.memo(Component, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id; // true = skip re-render
});
```

---

### Q79. What is virtualization in React?
**Answer:**
Virtualization (windowing) renders only the visible items in a large list — instead of rendering thousands of DOM nodes, only ~10-20 visible ones are rendered. This dramatically improves performance.

Libraries: `react-window`, `react-virtual`, `@tanstack/react-virtual`.

```jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList height={500} itemCount={10000} itemSize={35} width={300}>
  {({ index, style }) => <div style={style}>Row {index}</div>}
</FixedSizeList>
```

---

### Q80. What is the React Profiler?
**Answer:**
The React Profiler is a DevTools feature (and `<Profiler>` component) that measures how often a React app renders and the "cost" of those renders.

```jsx
<Profiler id="Navigation" onRender={(id, phase, actualDuration) => {
  console.log({ id, phase, actualDuration });
}}>
  <Navigation />
</Profiler>
```

---

## 18. React Router

### Q81. What is React Router?
**Answer:**
React Router is the standard routing library for React. It enables navigation between views/pages in a single-page application without full-page reloads.

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

<BrowserRouter>
  <nav>
    <Link to="/">Home</Link>
    <Link to="/about">About</Link>
  </nav>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/users/:id" element={<User />} />
  </Routes>
</BrowserRouter>
```

---

### Q82. What is the difference between `BrowserRouter` and `HashRouter`?
**Answer:**

| Feature | BrowserRouter | HashRouter |
|---|---|---|
| URL style | `/about` | `/#/about` |
| Server support | Needs server config | No server config needed |
| SEO | Better | Worse |
| Use case | Production apps | Static file hosting |

---

### Q83. How do you get URL parameters in React Router?
**Answer:**

```jsx
// Route definition
<Route path="/users/:id" element={<UserPage />} />

// Component
import { useParams } from 'react-router-dom';

function UserPage() {
  const { id } = useParams();
  return <div>User ID: {id}</div>;
}
```

---

### Q84. What are the hooks available in React Router v6?
**Answer:**
- `useParams` — Access URL parameters.
- `useNavigate` — Programmatically navigate.
- `useLocation` — Get the current location object.
- `useSearchParams` — Read and write URL query parameters.
- `useMatch` — Check if current URL matches a pattern.
- `useOutletContext` — Access context from parent route.

---

### Q85. How do you do programmatic navigation in React Router?
**Answer:**

```jsx
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await login();
    navigate('/dashboard');       // Navigate forward
    navigate(-1);                 // Go back
    navigate('/profile', { replace: true }); // Replace history entry
  };
}
```

---

### Q86. What are protected/private routes?
**Answer:**
Protected routes restrict access to authenticated users only.

```jsx
function PrivateRoute({ children }) {
  const isAuthenticated = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
```

---

## 19. State Management (Redux / Zustand)

### Q87. What is Redux?
**Answer:**
Redux is a predictable state container for JavaScript apps. It centralizes application state in a single store and enforces strict rules on how state can be updated.

**Core concepts:**
- **Store**: Single source of truth holding the entire app state.
- **Action**: Plain object describing what happened `{ type: 'INCREMENT' }`.
- **Reducer**: Pure function `(state, action) => newState`.
- **Dispatch**: Sends actions to the store.
- **Selector**: Reads data from the store.

---

### Q88. What are the three principles of Redux?
**Answer:**
1. **Single source of truth**: The entire app state is stored in a single store.
2. **State is read-only**: The only way to change state is to dispatch an action.
3. **Changes are made with pure functions**: Reducers are pure functions with no side effects.

---

### Q89. What is Redux Toolkit (RTK)?
**Answer:**
Redux Toolkit is the official, opinionated way to write Redux. It simplifies Redux setup by:
- `createSlice` — combines actions and reducers.
- `createAsyncThunk` — handles async operations.
- `configureStore` — sets up the store with sane defaults.
- `RTK Query` — data fetching and caching solution.

```jsx
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1 },
    decrement: state => { state.value -= 1 },
  }
});
```

---

### Q90. What is Zustand?
**Answer:**
Zustand is a small, fast, and scalable state management solution for React. Unlike Redux, it doesn't require boilerplate actions/reducers — just a store with state and setter functions.

```jsx
import { create } from 'zustand';

const useStore = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}));

function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
```

---

### Q91. What is the Context API vs Redux comparison?
**Answer:**

| Criteria | Context API | Redux |
|---|---|---|
| Boilerplate | Minimal | More |
| DevTools | No | Yes |
| Middleware | No | Yes (Thunk, Saga) |
| Performance | Can cause rerenders | Optimized selectors |
| Best for | Simple global data | Complex, shared state |

---

## 20. Error Boundaries

### Q92. What are Error Boundaries?
**Answer:**
Error Boundaries are class components that catch JavaScript errors in their child component tree during rendering, lifecycle methods, and constructors — preventing the whole app from crashing.

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logErrorToService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return <h1>Something went wrong.</h1>;
    return this.props.children;
  }
}

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

### Q93. What errors do Error Boundaries NOT catch?
**Answer:**
- Errors in **event handlers** (use regular try/catch).
- **Asynchronous code** (e.g., `setTimeout`, Promises).
- Errors in the **error boundary itself**.
- **Server-side rendering** errors.

---

### Q94. Is there a functional component equivalent of Error Boundaries?
**Answer:**
Not natively. Error Boundaries require class components. However, libraries like `react-error-boundary` provide a functional wrapper:

```jsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
  <MyComponent />
</ErrorBoundary>
```

---

## 21. Portals

### Q95. What are React Portals?
**Answer:**
Portals allow rendering a component's children into a different DOM node outside the parent component's DOM hierarchy — useful for modals, tooltips, and overlays.

```jsx
import ReactDOM from 'react-dom';

function Modal({ children }) {
  return ReactDOM.createPortal(
    <div className="modal">{children}</div>,
    document.getElementById('modal-root')
  );
}
```

**Key behavior**: Events still bubble through the React tree (not DOM tree), so event handling works as expected.

---

## 22. Fragments

### Q96. What are Fragments in React?
**Answer:**
Fragments let you group a list of children without adding extra DOM nodes.

```jsx
// Short syntax
function List() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
    </>
  );
}

// Long syntax (supports key prop)
<React.Fragment key={item.id}>
  <dt>{item.term}</dt>
  <dd>{item.description}</dd>
</React.Fragment>
```

---

## 23. Testing in React

### Q97. What are the main testing tools for React?
**Answer:**
- **Jest** — JavaScript test runner (default with Create React App).
- **React Testing Library (RTL)** — Tests components from a user's perspective.
- **Vitest** — Fast Jest-compatible test runner for Vite projects.
- **Cypress / Playwright** — End-to-end testing.
- **MSW (Mock Service Worker)** — API mocking.

---

### Q98. What is the React Testing Library philosophy?
**Answer:**
RTL's philosophy: *"The more your tests resemble the way your software is used, the more confidence they can give you."*

Tests interact with the DOM the same way a user would — by querying by text, role, label, etc. — not by component internals.

```jsx
import { render, screen, fireEvent } from '@testing-library/react';

test('increments counter on click', () => {
  render(<Counter />);
  fireEvent.click(screen.getByRole('button', { name: /increment/i }));
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

---

### Q99. What are the query types in React Testing Library?
**Answer:**

| Query | When to use |
|---|---|
| `getBy*` | Element must be present (throws if not found) |
| `queryBy*` | Element may or may not be present (returns null) |
| `findBy*` | Async — element appears after some time |

Query methods (preference order):
1. `ByRole` (most accessible)
2. `ByLabelText`
3. `ByPlaceholderText`
4. `ByText`
5. `ByDisplayValue`
6. `ByTestId` (last resort)

---

### Q100. How do you test asynchronous operations in RTL?
**Answer:**

```jsx
import { render, screen, waitFor } from '@testing-library/react';

test('displays user data after fetch', async () => {
  render(<UserProfile userId="1" />);
  
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
```

---

## 24. React Internals & Virtual DOM

### Q101. What is the diffing algorithm in React?
**Answer:**
React's diffing algorithm has O(n) complexity (instead of the theoretical O(n³)) by making two assumptions:
1. Elements of **different types** produce different trees.
2. Elements at the **same position** are assumed to be the same element.

**Key rules:**
- If root elements differ in type → old tree destroyed, new tree built.
- If same type → only attributes updated.
- For lists → use `key` to match elements across renders.

---

### Q102. What is batching in React?
**Answer:**
Batching is React's way of grouping multiple state updates into a single re-render for performance.

In React 17 and earlier, batching only happened in event handlers. In **React 18**, automatic batching works everywhere — including `setTimeout`, Promises, and native event handlers.

```jsx
// React 18 — both updates batched into ONE re-render
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Only ONE re-render
}, 1000);
```

---

### Q103. What is `flushSync` in React 18?
**Answer:**
`flushSync` forces React to flush updates synchronously inside the provided callback, bypassing automatic batching.

```jsx
import { flushSync } from 'react-dom';

flushSync(() => {
  setCount(1);  // Forces immediate re-render
});
// DOM updated here
```

---

## 25. TypeScript with React

### Q104. How do you type component props with TypeScript?
**Answer:**

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false, variant = 'primary' }) => (
  <button onClick={onClick} disabled={disabled} className={variant}>
    {label}
  </button>
);
```

---

### Q105. How do you type `useState` with TypeScript?
**Answer:**

```tsx
// TypeScript infers the type from initial value
const [count, setCount] = useState(0); // number

// Explicit typing when initial value is undefined/null
const [user, setUser] = useState<User | null>(null);

// Complex type
interface User { id: number; name: string; }
const [user, setUser] = useState<User>({ id: 1, name: 'Alice' });
```

---

### Q106. How do you type `useRef` with TypeScript?
**Answer:**

```tsx
// For DOM elements — initial value must be null
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus(); // optional chaining because it can be null

// For mutable values (non-null)
const timerRef = useRef<number | null>(null);
timerRef.current = window.setTimeout(() => {}, 1000);
```

---

### Q107. How do you type `useContext` with TypeScript?
**Answer:**

```tsx
interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

---

## 26. Security in React

### Q108. What is XSS (Cross-Site Scripting) and how does React protect against it?
**Answer:**
XSS is an attack where malicious scripts are injected into web pages. React automatically escapes values before rendering them, preventing XSS.

```jsx
const userInput = '<script>alert("xss")</script>';
// React renders this as text, not HTML — safe!
<div>{userInput}</div>
```

---

### Q109. What is `dangerouslySetInnerHTML` and when should you use it?
**Answer:**
`dangerouslySetInnerHTML` bypasses React's XSS protection and directly injects HTML. It should only be used with **sanitized**, trusted content.

```jsx
// ❌ DANGEROUS with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Use with sanitized content
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(trustedHTML) }} />
```

---

### Q110. How do you prevent CSRF attacks in React apps?
**Answer:**
CSRF (Cross-Site Request Forgery) prevention is handled on the backend, but the frontend can help by:
- Including CSRF tokens in request headers.
- Using SameSite cookies.
- Using frameworks/libraries that handle CSRF tokens (e.g., Axios with XSRF headers).

---

## 27. Advanced Patterns

### Q111. What is the Compound Component pattern?
**Answer:**
Compound components work together to form a complete UI. The parent provides implicit context to children, enabling flexible composition.

```jsx
function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.Tab = function Tab({ index, label }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      className={activeTab === index ? 'active' : ''}
      onClick={() => setActiveTab(index)}
    >
      {label}
    </button>
  );
};

// Usage
<Tabs>
  <Tabs.Tab index={0} label="Tab 1" />
  <Tabs.Tab index={1} label="Tab 2" />
</Tabs>
```

---

### Q112. What is the Container/Presentational pattern?
**Answer:**
- **Container (Smart) Components**: Manage state, data fetching, logic.
- **Presentational (Dumb) Components**: Receive props and render UI. No state/side effects.

This separation improves testability and reusability.

---

### Q113. What is the Observer pattern in React?
**Answer:**
The Observer pattern is implemented via pub/sub mechanisms. In React, this can be:
- Event emitters
- Context with subscriptions
- State management (Redux dispatches = publish, selectors = subscribe)
- React Query's cache (observers watch query state)

---

### Q114. What is the Factory pattern in React?
**Answer:**
A factory function or component that creates different components based on input:

```jsx
function ButtonFactory({ type, ...props }) {
  const components = {
    primary: PrimaryButton,
    secondary: SecondaryButton,
    danger: DangerButton,
  };
  const Component = components[type] || PrimaryButton;
  return <Component {...props} />;
}
```

---

## 28. React 18 & Concurrent Features

### Q115. What are the new features in React 18?
**Answer:**

1. **Automatic Batching** — Batch state updates everywhere (not just event handlers).
2. **`createRoot`** — New root API replacing `ReactDOM.render`.
3. **`startTransition`** — Mark non-urgent updates to keep UI responsive.
4. **`useTransition` hook** — Track pending transition state.
5. **`useDeferredValue` hook** — Defer re-rendering of non-critical parts.
6. **`useId` hook** — Stable unique IDs for accessibility.
7. **`useSyncExternalStore`** — Subscribe to external stores.
8. **Suspense on the server** — Streaming SSR with Suspense.
9. **`useInsertionEffect`** — For CSS-in-JS libraries.

---

### Q116. What is `startTransition`?
**Answer:**
`startTransition` marks state updates as non-urgent (transitions), allowing React to keep the UI responsive during expensive renders.

```jsx
import { startTransition } from 'react';

// Urgent update — responds immediately
setInputValue(value);

// Non-urgent — can be interrupted
startTransition(() => {
  setSearchResults(filter(data, value));
});
```

---

### Q117. What is `useTransition`?
**Answer:**
`useTransition` is a hook that returns `[isPending, startTransition]`. `isPending` is `true` while the transition is processing.

```jsx
const [isPending, startTransition] = useTransition();

const handleClick = () => {
  startTransition(() => {
    setTab(newTab);
  });
};

{isPending && <Spinner />}
```

---

### Q118. What is `useDeferredValue`?
**Answer:**
`useDeferredValue` defers re-rendering of a non-critical part of the UI, similar to debouncing.

```jsx
const [query, setQuery] = useState('');
const deferredQuery = useDeferredValue(query);

// SearchResults uses deferredQuery — renders with slight delay
// Input responds immediately to setQuery
<SearchResults query={deferredQuery} />
```

---

### Q119. What is Concurrent Mode?
**Answer:**
Concurrent Mode is a set of React features that allow React to prepare multiple versions of the UI simultaneously. Key capabilities:
- **Interrupting renders**: Long renders can be paused for urgent updates.
- **Deferred rendering**: Non-urgent work deferred to keep the UI responsive.
- **Progressive rendering**: Show partial results while the rest loads.

Enabled by using `createRoot` in React 18.

---

### Q120. What is Streaming SSR in React 18?
**Answer:**
Streaming SSR allows React to send HTML to the client in chunks as components are rendered on the server, rather than waiting for the entire page. Combined with Suspense, React can stream parts of the page as data becomes available — improving Time To First Byte (TTFB) and user experience.

```jsx
// Server
import { renderToPipeableStream } from 'react-dom/server';

const { pipe } = renderToPipeableStream(<App />, {
  onShellReady() { res.setHeader('Content-type', 'text/html'); pipe(res); }
});
```

---

## Quick Reference Summary

### Hook Cheat Sheet

| Hook | Purpose |
|---|---|
| `useState` | Local component state |
| `useEffect` | Side effects |
| `useContext` | Consume context |
| `useRef` | DOM access / mutable value |
| `useReducer` | Complex state logic |
| `useMemo` | Memoize computed value |
| `useCallback` | Memoize function |
| `useLayoutEffect` | Sync DOM measurement |
| `useImperativeHandle` | Customize ref exposure |
| `useId` | Stable unique IDs |
| `useTransition` | Mark non-urgent updates |
| `useDeferredValue` | Defer re-render |

---

### React Lifecycle to Hooks Mapping

| Class Lifecycle | Hooks Equivalent |
|---|---|
| `componentDidMount` | `useEffect(() => {}, [])` |
| `componentDidUpdate` | `useEffect(() => {}, [dep])` |
| `componentWillUnmount` | `useEffect(() => { return cleanup }, [])` |
| `shouldComponentUpdate` | `React.memo` / `useMemo` |
| `getDerivedStateFromProps` | `useState` + logic in render |
| `getSnapshotBeforeUpdate` | `useLayoutEffect` |

---

*This document covers 120+ React interview questions across 28 topics. Good luck with your interviews!*