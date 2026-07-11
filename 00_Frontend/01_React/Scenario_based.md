# React JS — Scenario-Based Interview Questions & Machine Coding Round

> A comprehensive collection of scenario-based questions, real-world problem solving, and machine coding challenges covering all areas of React.

---

## Table of Contents

### Scenario-Based Questions
1. [Component Design Scenarios](#1-component-design-scenarios)
2. [State Management Scenarios](#2-state-management-scenarios)
3. [Performance Scenarios](#3-performance-scenarios)
4. [Hooks Scenarios](#4-hooks-scenarios)
5. [Side Effects & Data Fetching Scenarios](#5-side-effects--data-fetching-scenarios)
6. [Event Handling Scenarios](#6-event-handling-scenarios)
7. [Forms Scenarios](#7-forms-scenarios)
8. [Routing Scenarios](#8-routing-scenarios)
9. [Error Handling Scenarios](#9-error-handling-scenarios)
10. [Authentication Scenarios](#10-authentication-scenarios)
11. [Real-World Architecture Scenarios](#11-real-world-architecture-scenarios)
12. [Testing Scenarios](#12-testing-scenarios)
13. [Next.js Scenarios](#13-nextjs-scenarios)

### Machine Coding Round
14. [UI Components](#14-ui-components)
15. [Interactive Features](#15-interactive-features)
16. [Data & API Problems](#16-data--api-problems)
17. [Real-World App Features](#17-real-world-app-features)
18. [Advanced Machine Coding](#18-advanced-machine-coding)

---

# SCENARIO-BASED QUESTIONS

---

## 1. Component Design Scenarios

---

### Q1. You have a Button component used across 50+ places. The design team wants to add a loading spinner inside the button when an async action is running. How do you do this without breaking existing usage?

**Answer:**
Extend the component with an optional `isLoading` prop that defaults to `false`. All 50 existing usages stay unchanged since they don't pass `isLoading`.

```jsx
// Before — existing Button
function Button({ children, onClick, disabled, variant = 'primary' }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}

// After — backward compatible with loading state
function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  isLoading = false,  // New prop — defaults to false, existing usage unaffected
  loadingText = 'Loading...',
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading} // Disable during loading
      className={`btn btn-${variant} ${isLoading ? 'btn-loading' : ''}`}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Existing usage — unchanged, still works
<Button onClick={handleSave}>Save</Button>

// New usage — with loading
function SaveForm() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await saveData();
    setLoading(false);
  };

  return (
    <Button onClick={handleSave} isLoading={loading} loadingText="Saving...">
      Save
    </Button>
  );
}
```

**Key principle:** Open/Closed Principle — open for extension, closed for modification.

---

### Q2. You need to build a component that can render as a `<button>`, `<a>`, or `<div>` depending on props. How do you design it?

**Answer:**
Use a polymorphic component pattern with the `as` prop.

```jsx
// Polymorphic component
function ClickableBase({
  as: Component = 'button', // Default to button
  children,
  className = '',
  ...props
}) {
  return (
    <Component className={`clickable ${className}`} {...props}>
      {children}
    </Component>
  );
}

// Usage
<ClickableBase>I am a button</ClickableBase>
<ClickableBase as="a" href="/about">I am a link</ClickableBase>
<ClickableBase as="div" role="button" tabIndex={0}>I am a div</ClickableBase>
<ClickableBase as={Link} to="/dashboard">React Router Link</ClickableBase>

// With TypeScript
type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

function Clickable<T extends React.ElementType = 'button'>({
  as,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as || 'button';
  return <Component {...props}>{children}</Component>;
}
```

---

### Q3. A colleague built a deeply nested component tree. Data needs to pass from the top-level App to a component 6 levels deep. What are your options and what do you recommend?

**Answer:**

```jsx
// Option 1: Prop drilling — BAD for 6 levels
<App>
  <Layout userRole={userRole}>         // Level 1
    <Dashboard userRole={userRole}>    // Level 2
      <Sidebar userRole={userRole}>    // Level 3
        <Menu userRole={userRole}>     // Level 4
          <MenuItem userRole={userRole}> // Level 5
            <AdminLink userRole={userRole} /> // Level 6
          </MenuItem>
        </Menu>
      </Sidebar>
    </Dashboard>
  </Layout>
</App>

// Option 2: Context API — GOOD for static/rarely changing data
const UserContext = createContext(null);

function App() {
  const [user] = useState({ role: 'admin', name: 'Alice' });
  return (
    <UserContext.Provider value={user}>
      <Layout />  {/* No props needed */}
    </UserContext.Provider>
  );
}

// Deep component — directly consumes
function AdminLink() {
  const user = useContext(UserContext);
  if (user.role !== 'admin') return null;
  return <a href="/admin">Admin Panel</a>;
}

// Option 3: Component composition — BEST when structure allows it
// Instead of passing data down, pass the component itself down
function App() {
  const [user] = useState({ role: 'admin' });
  return (
    <Layout>
      <Dashboard
        sidebar={<Sidebar adminLink={user.role === 'admin' ? <AdminLink /> : null} />}
      />
    </Layout>
  );
}

// Option 4: Global state (Zustand/Redux) — for frequently changing shared state
const useUserStore = create(set => ({
  user: null,
  setUser: (user) => set({ user }),
}));

function AdminLink() {
  const user = useUserStore(state => state.user); // Direct access anywhere
  if (user?.role !== 'admin') return null;
  return <a href="/admin">Admin Panel</a>;
}
```

**Recommendation:**
- Static data (theme, user role, locale) → Context API
- Component-specific slots → Component composition
- Frequently changing global state → Zustand/Redux

---

### Q4. You need to build a Modal component. The modal should trap focus, close on Escape key, and prevent body scroll. How do you implement it?

**Answer:**

```jsx
import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus(); // Focus first focusable element

      const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;
        const focusable = overlayRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableArray = Array.from(focusable || []);
        const first = focusableArray[0];
        const last = focusableArray[focusableArray.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Portal — renders outside the component tree in #modal-root
  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()} // Click outside closes
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button ref={closeButtonRef} onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.getElementById('modal-root') // Portal target
  );
}

// Usage
function App() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Action">
        <p>Are you sure you want to do this?</p>
        <button onClick={() => setIsOpen(false)}>Cancel</button>
        <button onClick={handleConfirm}>Confirm</button>
      </Modal>
    </>
  );
}
```

---

### Q5. How do you build a reusable Table component that supports sorting, filtering, and pagination?

**Answer:**

```jsx
import { useState, useMemo } from 'react';

function useTable({ data, columns, pageSize = 10 }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filtered = useMemo(() => {
    if (!filterText) return data;
    return data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(filterText.toLowerCase())
      )
    );
  }, [data, filterText]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortConfig]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  return {
    rows: paginated,
    sortConfig,
    requestSort,
    filterText,
    setFilterText,
    currentPage,
    setCurrentPage,
    totalPages,
    totalRows: filtered.length,
  };
}

function Table({ data, columns, pageSize = 10 }) {
  const {
    rows, sortConfig, requestSort,
    filterText, setFilterText,
    currentPage, setCurrentPage, totalPages, totalRows,
  } = useTable({ data, columns, pageSize });

  return (
    <div>
      <input
        type="search"
        placeholder="Search..."
        value={filterText}
        onChange={e => { setFilterText(e.target.value); }}
      />
      <p>{totalRows} results</p>

      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && requestSort(col.key)}
                style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
              >
                {col.label}
                {sortConfig.key === col.key && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
          Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

// Usage
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'status', label: 'Status', render: (val) => <Badge>{val}</Badge> },
  { key: 'actions', label: '', sortable: false, render: (_, row) => (
    <button onClick={() => handleEdit(row)}>Edit</button>
  )},
];

<Table data={users} columns={columns} pageSize={10} />
```

---

## 2. State Management Scenarios

---

### Q6. You have a shopping cart that needs to be accessible across multiple pages. Where do you store the cart state and why?

**Answer:**

```jsx
// Best approach: Zustand + localStorage persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => set(state => {
        const existing = state.items.find(i => i.id === product.id);
        if (existing) {
          return {
            items: state.items.map(i =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          };
        }
        return { items: [...state.items, { ...product, quantity: 1 }] };
      }),

      removeItem: (id) => set(state => ({
        items: state.items.filter(i => i.id !== id)
      })),

      updateQuantity: (id, quantity) => set(state => ({
        items: quantity <= 0
          ? state.items.filter(i => i.id !== id)
          : state.items.map(i => i.id === id ? { ...i, quantity } : i)
      })),

      clearCart: () => set({ items: [] }),

      // Computed values
      get totalItems() { return get().items.reduce((sum, i) => sum + i.quantity, 0); },
      get totalPrice() { return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0); },
    }),
    {
      name: 'shopping-cart',  // localStorage key
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);

// Use anywhere in the app
function CartIcon() {
  const totalItems = useCartStore(state => state.totalItems);
  return <span>Cart ({totalItems})</span>;
}

function ProductCard({ product }) {
  const addItem = useCartStore(state => state.addItem);
  return <button onClick={() => addItem(product)}>Add to cart</button>;
}
```

**Why not Context API?**
Every context value change re-renders ALL consumers. A cart that updates on every item add would cause performance issues. Zustand's selector-based subscriptions only re-render components that use the changed piece of state.

---

### Q7. Your component has a complex form with 15+ fields, validations, and conditional fields. How do you manage this state?

**Answer:**

```jsx
import { useReducer } from 'react';

// Use useReducer for complex form state
const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  state: '',
  city: '',
  hasCompany: false,
  companyName: '',
  companySize: '',
  errors: {},
  touched: {},
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: '' }, // Clear error on change
      };

    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };

    case 'SET_ERRORS':
      return { ...state, errors: action.errors };

    case 'TOGGLE_COMPANY':
      return {
        ...state,
        hasCompany: !state.hasCompany,
        companyName: '',
        companySize: '',
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

function validate(state) {
  const errors = {};
  if (!state.firstName) errors.firstName = 'First name is required';
  if (!state.email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(state.email)) errors.email = 'Invalid email';
  if (!state.phone) errors.phone = 'Phone is required';
  if (state.hasCompany && !state.companyName) errors.companyName = 'Company name is required';
  return errors;
}

function ComplexForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleChange = (field) => (e) => {
    dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  };

  const handleBlur = (field) => () => {
    dispatch({ type: 'SET_TOUCHED', field });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate(state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      return;
    }
    submitForm(state);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={state.firstName}
        onChange={handleChange('firstName')}
        onBlur={handleBlur('firstName')}
      />
      {state.touched.firstName && state.errors.firstName && (
        <span className="error">{state.errors.firstName}</span>
      )}

      {/* Conditional fields */}
      <label>
        <input
          type="checkbox"
          checked={state.hasCompany}
          onChange={() => dispatch({ type: 'TOGGLE_COMPANY' })}
        />
        I represent a company
      </label>

      {state.hasCompany && (
        <>
          <input
            placeholder="Company name"
            value={state.companyName}
            onChange={handleChange('companyName')}
          />
          {state.errors.companyName && <span>{state.errors.companyName}</span>}
        </>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

### Q8. Two sibling components need to share state. Component A updates data, Component B displays it. How do you handle this?

**Answer:**

```jsx
// Approach 1: Lift state up to parent (when siblings share a close parent)
function Parent() {
  const [data, setData] = useState('');

  return (
    <div>
      <ComponentA data={data} setData={setData} />
      <ComponentB data={data} />
    </div>
  );
}

function ComponentA({ data, setData }) {
  return <input value={data} onChange={e => setData(e.target.value)} />;
}

function ComponentB({ data }) {
  return <p>You typed: {data}</p>;
}

// Approach 2: Context (when siblings are far apart)
const SharedContext = createContext(null);

function SharedProvider({ children }) {
  const [data, setData] = useState('');
  return (
    <SharedContext.Provider value={{ data, setData }}>
      {children}
    </SharedContext.Provider>
  );
}

// Approach 3: Zustand (best for complex shared state)
const useSharedStore = create(set => ({
  data: '',
  setData: (data) => set({ data }),
}));

function ComponentA() {
  const setData = useSharedStore(state => state.setData);
  return <input onChange={e => setData(e.target.value)} />;
}

function ComponentB() {
  const data = useSharedStore(state => state.data);
  return <p>You typed: {data}</p>;
}
```

---

### Q9. You notice your Redux store is getting bloated with 50+ actions for a single feature. How do you restructure it?

**Answer:**

```jsx
// Problem: too many granular actions
dispatch({ type: 'SET_USER_FIRST_NAME', payload: 'Alice' });
dispatch({ type: 'SET_USER_LAST_NAME', payload: 'Smith' });
dispatch({ type: 'SET_USER_EMAIL', payload: 'alice@example.com' });
dispatch({ type: 'SET_USER_LOADING', payload: true });

// Solution 1: Use Redux Toolkit createSlice — reduces boilerplate dramatically
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const fetchUser = createAsyncThunk('user/fetch', async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    // One action for partial updates instead of 10 separate SET actions
    updateUser: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
    clearUser: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => { state.loading = true; })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Now one action does the work of many
dispatch(updateUser({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' }));

// Solution 2: Use React Query / TanStack Query instead of Redux for server state
// Redux should only manage CLIENT state — not server cache
import { useQuery, useMutation } from '@tanstack/react-query';

function UserProfile({ userId }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  });

  const mutation = useMutation({
    mutationFn: (updates) => fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
    onSuccess: () => queryClient.invalidateQueries(['user', userId]),
  });
}
```

---

## 3. Performance Scenarios

---

### Q10. Your list component with 1000 items is laggy when filtering. How do you fix it?

**Answer:**

```jsx
// Problem: filtering 1000 items on every keystroke causes lag

// Solution 1: useMemo — avoid recomputing on every render
function ItemList({ items }) {
  const [filter, setFilter] = useState('');

  // Without useMemo — recomputes every render even if items/filter didn't change
  // const filtered = items.filter(item => item.name.includes(filter));

  // With useMemo — only recomputes when items or filter changes
  const filtered = useMemo(
    () => items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    ),
    [items, filter]
  );

  return (
    <>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      {filtered.map(item => <Item key={item.id} item={item} />)}
    </>
  );
}

// Solution 2: Debounce filter input — don't filter on every keystroke
function ItemList({ items }) {
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setFilter(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const filtered = useMemo(
    () => items.filter(item => item.name.toLowerCase().includes(filter.toLowerCase())),
    [items, filter]
  );

  return (
    <>
      <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
      {filtered.map(item => <Item key={item.id} item={item} />)}
    </>
  );
}

// Solution 3: Virtualization — render only visible items (best for 1000+)
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const [filter, setFilter] = useState('');
  const filtered = useMemo(
    () => items.filter(item => item.name.toLowerCase().includes(filter.toLowerCase())),
    [items, filter]
  );

  const Row = ({ index, style }) => (
    <div style={style}>
      <Item item={filtered[index]} />
    </div>
  );

  return (
    <>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      <FixedSizeList
        height={600}
        itemCount={filtered.length}
        itemSize={60}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </>
  );
}

// Solution 4: Move filter to server — don't load 1000 items upfront
function ServerFilteredList() {
  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebounce(filter, 300);

  const { data } = useQuery({
    queryKey: ['items', debouncedFilter],
    queryFn: () => fetch(`/api/items?q=${debouncedFilter}`).then(r => r.json()),
  });

  return (
    <>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      {data?.map(item => <Item key={item.id} item={item} />)}
    </>
  );
}
```

---

### Q11. A parent component re-renders frequently. A child component that receives a function prop also re-renders even though its own props didn't change. How do you fix this?

**Answer:**

```jsx
// Problem
function Parent() {
  const [count, setCount] = useState(0);

  // New function reference created on every render
  const handleClick = () => console.log('clicked'); // NEW function each render

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <ExpensiveChild onClick={handleClick} /> {/* Re-renders even though onClick "didn't change" */}
    </>
  );
}

const ExpensiveChild = React.memo(({ onClick }) => {
  console.log('ExpensiveChild rendered');
  return <button onClick={onClick}>Click me</button>;
});

// Fix: useCallback + React.memo
function Parent() {
  const [count, setCount] = useState(0);

  // Stable function reference — only recreated when dependencies change
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // Empty deps = never recreated

  // With dependencies
  const handleDelete = useCallback((id) => {
    deleteItem(id);
  }, [deleteItem]); // Recreated only when deleteItem changes

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <ExpensiveChild onClick={handleClick} /> {/* No longer re-renders unnecessarily */}
    </>
  );
}

// The complete solution: React.memo + useCallback work together
// React.memo: prevents re-render if props are shallowly equal
// useCallback: ensures function props are shallowly equal across renders
```

---

### Q12. Your app's initial bundle is too large (5MB+). How do you reduce it?

**Answer:**

```jsx
// 1. Route-based code splitting — biggest impact
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ❌ Before — all pages in one bundle
import HomePage from './pages/Home';
import DashboardPage from './pages/Dashboard';
import AdminPage from './pages/Admin';

// ✅ After — each page is a separate chunk
const HomePage = lazy(() => import('./pages/Home'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const AdminPage = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Suspense>
  );
}

// 2. Lazy load heavy components
const Chart = lazy(() => import('./components/Chart'));
const RichEditor = lazy(() => import('./components/RichEditor'));
const PDFViewer = lazy(() => import('./components/PDFViewer'));

// 3. Replace heavy libraries with lighter alternatives
// ❌ moment.js (300KB) → ✅ date-fns or dayjs (10KB)
// ❌ lodash (70KB) → ✅ individual imports
import debounce from 'lodash/debounce'; // Only debounce, not all of lodash

// 4. Tree shaking — only import what you use
// ❌ imports entire library
import * as Icons from '@heroicons/react';
// ✅ imports only what's needed
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline';

// 5. Analyze bundle with webpack-bundle-analyzer
// npx webpack-bundle-analyzer stats.json

// 6. Dynamic imports for feature-specific code
function AdminPanel() {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [Editor, setEditor] = useState(null);

  const handleOpenEditor = async () => {
    const { default: RichEditor } = await import('./RichEditor');
    setEditor(() => RichEditor);
    setEditorLoaded(true);
  };

  return (
    <>
      <button onClick={handleOpenEditor}>Open Editor</button>
      {editorLoaded && Editor && <Editor />}
    </>
  );
}
```

---

## 4. Hooks Scenarios

---

### Q13. You're fetching user data inside useEffect but sometimes see stale data. What causes this and how do you fix it?

**Answer:**

```jsx
// Problem 1: Race condition — fast typing triggers multiple fetches
function UserSearch() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!query) return;
    // ❌ If user types fast: fetch('alice'), fetch('bob')
    // 'alice' response arrives after 'bob' → stale data!
    fetch(`/api/users?q=${query}`)
      .then(r => r.json())
      .then(setUser);
  }, [query]);

  // Fix: cleanup flag or AbortController
  useEffect(() => {
    if (!query) return;
    let isCancelled = false; // Cleanup flag
    const controller = new AbortController();

    fetch(`/api/users?q=${query}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (!isCancelled) setUser(data); // Only update if not cancelled
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => {
      isCancelled = true;
      controller.abort(); // Cancel pending request
    };
  }, [query]);
}

// Problem 2: Stale closure — accessing outdated state inside effect
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // ❌ Stale closure — count is always 0!
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []); // count not in deps

  // ✅ Fix: functional update — always uses latest value
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1); // No closure issue
    }, 1000);
    return () => clearInterval(interval);
  }, []);
}

// Problem 3: Missing dependencies
function DataFetcher({ userId }) {
  useEffect(() => {
    // ❌ userId not in deps — fetches for old userId even after prop changes
    fetchUser(userId).then(setUser);
  }, []); // Bug!

  // ✅ Fix: include all dependencies
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]); // Re-fetches when userId changes
}
```

---

### Q14. How do you implement a custom hook that syncs state with localStorage?

**Answer:**

```jsx
import { useState, useEffect, useCallback } from 'react';

function useLocalStorage(key, initialValue) {
  // Initialize state from localStorage or initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });

  // Sync to localStorage whenever value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  // Remove from storage
  const removeValue = useCallback(() => {
    localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setStoredValue, removeValue];
}

// Usage
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}
```

---

### Q15. You need to detect when a user is idle for 5 minutes and log them out. How do you implement this with hooks?

**Answer:**

```jsx
import { useEffect, useRef, useCallback } from 'react';

function useIdleTimer({ timeout = 5 * 60 * 1000, onIdle }) {
  const timerRef = useRef(null);
  const isIdleRef = useRef(false);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (isIdleRef.current) {
      isIdleRef.current = false; // User is active again
    }

    timerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      onIdle();
    }, timeout);
  }, [timeout, onIdle]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer(); // Start the timer

    return () => {
      clearTimeout(timerRef.current);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);
}

// Usage
function App() {
  const { logout } = useAuth();

  const handleIdle = useCallback(() => {
    alert('You have been logged out due to inactivity');
    logout();
  }, [logout]);

  useIdleTimer({ timeout: 5 * 60 * 1000, onIdle: handleIdle });

  return <div>App content</div>;
}
```

---

### Q16. How do you prevent a useEffect from running on the initial render?

**Answer:**

```jsx
import { useEffect, useRef } from 'react';

// Custom hook: useUpdateEffect — skips first render
function useUpdateEffect(effect, deps) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    return effect();
  }, deps);
}

// Usage — only runs when count CHANGES, not on mount
function Counter() {
  const [count, setCount] = useState(0);

  useUpdateEffect(() => {
    console.log('Count changed to:', count); // Won't log on initial render
  }, [count]);

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Inline approach
function Component({ value }) {
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return; // Skip first render
    }
    // Only runs on updates
    doSomethingWith(value);
  }, [value]);
}
```

---

## 5. Side Effects & Data Fetching Scenarios

---

### Q17. How do you handle loading, error, and success states for API calls cleanly?

**Answer:**

```jsx
// Custom hook for data fetching
function useFetch(url, options = {}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setState({ data: null, loading: true, error: null });

    fetch(url, { ...options, signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (isMounted) setState({ data, loading: false, error: null });
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        if (isMounted) setState({ data: null, loading: false, error: err.message });
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url]);

  return state;
}

// Usage with clean JSX
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage message={error} onRetry={() => refetch()} />;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Or use TanStack Query — handles all these cases + caching + retry
import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }) {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
  return <div>{user.name}</div>;
}
```

---

### Q18. You need to make multiple API calls in parallel and show results when all complete. How?

**Answer:**

```jsx
function Dashboard({ userId }) {
  const [data, setData] = useState({ user: null, posts: null, notifications: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ❌ Sequential — slow (waits for each one)
    // const user = await fetchUser(userId);
    // const posts = await fetchPosts(userId);
    // const notifs = await fetchNotifications(userId);

    // ✅ Parallel with Promise.all
    Promise.all([
      fetch(`/api/users/${userId}`).then(r => r.json()),
      fetch(`/api/posts?userId=${userId}`).then(r => r.json()),
      fetch(`/api/notifications?userId=${userId}`).then(r => r.json()),
    ])
      .then(([user, posts, notifications]) => {
        setData({ user, posts, notifications });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  // ✅ With TanStack Query — even cleaner
  const results = useQueries({
    queries: [
      { queryKey: ['user', userId], queryFn: () => fetchUser(userId) },
      { queryKey: ['posts', userId], queryFn: () => fetchPosts(userId) },
      { queryKey: ['notifications', userId], queryFn: () => fetchNotifications(userId) },
    ],
  });

  const isLoading = results.some(r => r.isLoading);
  const [userResult, postsResult, notifsResult] = results;
}
```

---

## 6. Event Handling Scenarios

---

### Q19. You have a search input that makes API calls. How do you prevent excessive API calls while the user is typing?

**Answer:**

```jsx
// Solution: Debounce — wait until user stops typing
function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');

  // Method 1: useEffect + setTimeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) onSearch(value);
    }, 400);
    return () => clearTimeout(timer); // Cancel if user types again
  }, [value, onSearch]);

  return <input value={value} onChange={e => setValue(e.target.value)} />;
}

// Method 2: Custom useDebounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery); // Only called 400ms after user stops typing
    }
  }, [debouncedQuery]);

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {/* Input is immediate — display is debounced */}
    </>
  );
}
```

---

### Q20. You need to handle infinite scroll on a list. How do you implement it?

**Answer:**

```jsx
// Using IntersectionObserver — best approach
function useInfiniteScroll({ onLoadMore, hasMore, isLoading }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading]);

  return sentinelRef;
}

function InfiniteList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const newItems = await fetchItems(page);
    if (newItems.length === 0) {
      setHasMore(false);
    } else {
      setItems(prev => [...prev, ...newItems]);
      setPage(p => p + 1);
    }
    setIsLoading(false);
  }, [page, isLoading, hasMore]);

  const sentinelRef = useInfiniteScroll({ onLoadMore: loadMore, hasMore, isLoading });

  // Load initial data
  useEffect(() => { loadMore(); }, []);

  return (
    <div>
      {items.map(item => <ItemCard key={item.id} item={item} />)}
      {isLoading && <Spinner />}
      {/* Sentinel element — when visible, triggers loadMore */}
      <div ref={sentinelRef} style={{ height: '1px' }} />
      {!hasMore && <p>No more items</p>}
    </div>
  );
}
```

---

## 7. Forms Scenarios

---

### Q21. You need to build a multi-step form where the user can go back and the data is preserved. How do you implement it?

**Answer:**

```jsx
import { useState, useCallback } from 'react';

const STEPS = ['personal', 'address', 'payment', 'review'];

const initialData = {
  personal: { firstName: '', lastName: '', email: '' },
  address: { street: '', city: '', country: '' },
  payment: { cardNumber: '', expiry: '', cvv: '' },
};

function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const updateStepData = useCallback((step, data) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }));
  }, []);

  const validateStep = (step) => {
    const stepErrors = {};
    if (step === 'personal') {
      if (!formData.personal.firstName) stepErrors.firstName = 'Required';
      if (!formData.personal.email) stepErrors.email = 'Required';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    const step = STEPS[currentStep];
    if (validateStep(step)) {
      setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));

  const handleSubmit = () => {
    submitAllData(formData);
  };

  const stepComponents = {
    personal: <PersonalStep data={formData.personal} onChange={d => updateStepData('personal', d)} errors={errors} />,
    address: <AddressStep data={formData.address} onChange={d => updateStepData('address', d)} />,
    payment: <PaymentStep data={formData.payment} onChange={d => updateStepData('payment', d)} />,
    review: <ReviewStep formData={formData} />,
  };

  return (
    <div>
      {/* Progress indicator */}
      <div className="steps-indicator">
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`step ${index < currentStep ? 'done' : ''} ${index === currentStep ? 'active' : ''}`}
          >
            {index + 1}. {step}
          </div>
        ))}
      </div>

      {/* Current step */}
      {stepComponents[STEPS[currentStep]]}

      {/* Navigation */}
      <div className="step-navigation">
        {currentStep > 0 && <button onClick={prevStep}>Back</button>}
        {currentStep < STEPS.length - 1 ? (
          <button onClick={nextStep}>Next</button>
        ) : (
          <button onClick={handleSubmit}>Submit</button>
        )}
      </div>
    </div>
  );
}
```

---

## 8. Routing Scenarios

---

### Q22. A user directly accesses a protected route without being logged in. How do you handle this?

**Answer:**

```jsx
// Solution: Protected Route wrapper
function ProtectedRoute({ children, requiredRole }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show spinner while checking auth
  if (isLoading) return <FullPageSpinner />;

  // Not authenticated — redirect to login, save intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but wrong role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Route setup
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/unauthorized" element={<Unauthorized />} />

  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
  </Route>

  <Route element={<ProtectedRoute requiredRole="admin" />}>
    <Route path="/admin" element={<AdminPanel />} />
  </Route>
</Routes>

// Login page — redirect back after login
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (credentials) => {
    await login(credentials);
    navigate(from, { replace: true }); // Go back to intended page
  };
}
```

---

## 9. Error Handling Scenarios

---

### Q23. A critical component in your app crashes and takes down the whole UI. How do you prevent this?

**Answer:**

```jsx
// Error Boundary class component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to error tracking service
    Sentry.captureException(error, { extra: info });
    console.error('Component Error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap different sections independently
function App() {
  return (
    <div>
      <Header />  {/* Doesn't crash the whole app if a section errors */}
      <ErrorBoundary fallback={<p>Dashboard failed to load</p>}>
        <Dashboard />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>Sidebar unavailable</p>}>
        <Sidebar />
      </ErrorBoundary>
    </div>
  );
}

// Use react-error-boundary library for functional approach
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong: {error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => clearState()}
  onError={(error, info) => logError(error, info)}
>
  <ProblematicComponent />
</ErrorBoundary>
```

---

## 10. Authentication Scenarios

---

### Q24. How do you implement a token refresh mechanism so users don't get logged out when their JWT expires?

**Answer:**

```jsx
// Axios interceptor approach
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Request interceptor — attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401 and refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });

        localStorage.setItem('accessToken', data.accessToken);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// React hook to use this
function useApi() {
  return { get: api.get, post: api.post, put: api.put, delete: api.delete };
}
```

---

## 11. Real-World Architecture Scenarios

---

### Q25. How would you architect a large-scale React application with 50+ developers working on it?

**Answer:**

```
Feature-based folder structure (not type-based)

src/
├── app/               # App-level setup
│   ├── store.ts       # Global store
│   ├── router.tsx     # Route config
│   └── providers.tsx  # All providers
│
├── features/          # Feature modules (vertical slices)
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── api/
│   │   └── index.ts   # Public API of this feature
│   ├── dashboard/
│   ├── products/
│   └── orders/
│
├── shared/            # Shared across features
│   ├── components/    # Design system components
│   ├── hooks/         # Shared custom hooks
│   ├── utils/         # Utilities
│   ├── types/         # Shared TypeScript types
│   └── api/           # Base API client
│
└── pages/             # Route pages (thin, just compose features)
    ├── DashboardPage.tsx
    └── ProductsPage.tsx
```

```jsx
// Key principles:

// 1. Each feature exposes a public API — internal implementation is hidden
// features/products/index.ts
export { ProductList } from './components/ProductList';
export { useProducts } from './hooks/useProducts';
export type { Product } from './types';
// DO NOT export internal implementation details

// 2. Strict boundaries — features don't import from each other
// ❌ Bad: features/orders importing from features/products
// ✅ Good: both import from shared/

// 3. Shared components are generic — no business logic
// shared/components/DataTable.tsx — generic table
// features/products/ProductTable.tsx — uses DataTable with product-specific config

// 4. Feature-level code splitting
const ProductsFeature = lazy(() => import('./features/products'));
const OrdersFeature = lazy(() => import('./features/orders'));

// 5. Consistent patterns — team uses same approach everywhere
// - Custom hooks for all data fetching (useProducts, useOrders)
// - Same error handling pattern
// - Same loading state pattern
```

---

## 12. Testing Scenarios

---

### Q26. How do you test a component that makes API calls?

**Answer:**

```jsx
// Component to test
function UserCard({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false); });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div data-testid="user-name">{user.name}</div>;
}

// Test file
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock server using MSW (Mock Service Worker)
const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, name: 'Alice Smith' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays user name after loading', async () => {
  render(<UserCard userId="1" />);

  // Initially shows loading
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // After API call, shows user name
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('Alice Smith');
  });
});

test('handles API error gracefully', async () => {
  server.use(
    rest.get('/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  render(<UserCard userId="1" />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

## 13. Next.js Scenarios

---

### Q27. Your Next.js page loads slowly because it fetches a lot of data server-side. How do you optimize it?

**Answer:**

```jsx
// Problem: everything blocks the page from loading
export default async function DashboardPage() {
  // These run sequentially — slow!
  const user = await fetchUser();         // 500ms
  const stats = await fetchStats();       // 800ms
  const notifications = await fetchNotifs(); // 400ms
  // Total: 1700ms before page shows anything

  return <Dashboard user={user} stats={stats} notifications={notifications} />;
}

// Solution 1: Parallel data fetching
export default async function DashboardPage() {
  // Run all in parallel
  const [user, stats, notifications] = await Promise.all([
    fetchUser(),
    fetchStats(),
    fetchNotifications(),
  ]);
  // Total: ~800ms (longest single request)
}

// Solution 2: Streaming with Suspense — show page shell immediately
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      <DashboardHeader />  {/* Static — renders immediately */}

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />    {/* Slow — streams in when ready */}
      </Suspense>

      <Suspense fallback={<NotifSkeleton />}>
        <NotificationsSection />  {/* Streams in independently */}
      </Suspense>
    </div>
  );
}

// Each section fetches its own data
async function StatsSection() {
  const stats = await fetchStats(); // Only blocks this section
  return <StatsDisplay stats={stats} />;
}

// Solution 3: Cache data that doesn't change often
async function fetchStats() {
  const res = await fetch('/api/stats', {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  return res.json();
}
```

---

# MACHINE CODING ROUND

---

## 14. UI Components

---

### Machine Code 1: Build an Accordion Component

**Requirements:** Multiple items, only one open at a time, smooth animation, accessible.

```jsx
import { useState } from 'react';

function Accordion({ items, allowMultiple = false }) {
  const [openItems, setOpenItems] = useState(new Set());

  const toggle = (id) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear(); // Only one open at a time
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="accordion" role="list">
      {items.map(item => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  );
}

function AccordionItem({ item, isOpen, onToggle }) {
  const contentId = `accordion-content-${item.id}`;
  const headerId = `accordion-header-${item.id}`;

  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`} role="listitem">
      <button
        id={headerId}
        className="accordion-header"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span>{item.title}</span>
        <span
          className="accordion-icon"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className="accordion-content"
        style={{
          maxHeight: isOpen ? '500px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div className="accordion-body">{item.content}</div>
      </div>
    </div>
  );
}

// Usage
const items = [
  { id: 1, title: 'What is React?', content: 'React is a JavaScript library...' },
  { id: 2, title: 'What is JSX?', content: 'JSX is a syntax extension...' },
  { id: 3, title: 'What are hooks?', content: 'Hooks are functions that...' },
];

<Accordion items={items} />
<Accordion items={items} allowMultiple />
```

---

### Machine Code 2: Build a Star Rating Component

```jsx
import { useState } from 'react';

function StarRating({ maxStars = 5, initialRating = 0, onChange, readOnly = false }) {
  const [rating, setRating] = useState(initialRating);
  const [hovered, setHovered] = useState(0);

  const displayRating = hovered || rating;

  const handleClick = (star) => {
    if (readOnly) return;
    const newRating = star === rating ? 0 : star; // Click same star to unrate
    setRating(newRating);
    onChange?.(newRating);
  };

  return (
    <div
      className="star-rating"
      role="radiogroup"
      aria-label={`Rating: ${rating} of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }, (_, i) => i + 1).map(star => (
        <button
          key={star}
          role="radio"
          aria-checked={rating === star}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          disabled={readOnly}
          className="star-btn"
          style={{ background: 'none', border: 'none', cursor: readOnly ? 'default' : 'pointer' }}
        >
          <span
            style={{
              fontSize: '2rem',
              color: star <= displayRating ? '#FFD700' : '#DDD',
              transition: 'color 0.1s, transform 0.1s',
              display: 'inline-block',
              transform: star === hovered ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            ★
          </span>
        </button>
      ))}
      <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666' }}>
        {rating > 0 ? `${rating} / ${maxStars}` : 'Not rated'}
      </span>
    </div>
  );
}

// Usage
function ReviewForm() {
  const [rating, setRating] = useState(0);
  return (
    <div>
      <StarRating onChange={setRating} />
      <p>You rated: {rating} stars</p>
      <StarRating initialRating={4} readOnly />
    </div>
  );
}
```

---

### Machine Code 3: Build a Toast Notification System

```jsx
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'info', duration = 3000 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const TOAST_STYLES = {
  success: { background: '#10B981', icon: '✓' },
  error: { background: '#EF4444', icon: '✕' },
  warning: { background: '#F59E0B', icon: '⚠' },
  info: { background: '#3B82F6', icon: 'ℹ' },
};

function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      style={{
        position: 'fixed', bottom: '1rem', right: '1rem',
        display: 'flex', flexDirection: 'column', gap: '8px',
        zIndex: 9999, maxWidth: '380px',
      }}
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const { background, icon } = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  return (
    <div
      role="alert"
      style={{
        background, color: 'white', padding: '12px 16px',
        borderRadius: '8px', display: 'flex', alignItems: 'center',
        gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.3s ease',
      }}
    >
      <span aria-hidden="true">{icon}</span>
      <p style={{ flex: 1, margin: 0, fontSize: '14px' }}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0 4px' }}
      >
        ✕
      </button>
    </div>
  );
}

// Usage
function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

function AppContent() {
  const { addToast } = useToast();

  return (
    <div>
      <button onClick={() => addToast({ message: 'Saved!', type: 'success' })}>
        Show success
      </button>
      <button onClick={() => addToast({ message: 'Something went wrong', type: 'error', duration: 5000 })}>
        Show error
      </button>
    </div>
  );
}
```

---

### Machine Code 4: Build a Tabs Component

```jsx
import { useState, useRef } from 'react';

function Tabs({ tabs, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabListRef = useRef(null);

  // Keyboard navigation
  const handleKeyDown = (e, currentId) => {
    const currentIndex = tabs.findIndex(t => t.id === currentId);
    let nextIndex;

    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabs.length - 1;
    else return;

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    setActiveTab(nextTab.id);
    tabListRef.current?.querySelector(`[data-tab="${nextTab.id}"]`)?.focus();
  };

  return (
    <div className="tabs">
      <div role="tablist" ref={tabListRef} aria-label="Tab navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            data-tab={tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={e => handleKeyDown(e, tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            disabled={tab.disabled}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
        >
          {activeTab === tab.id && tab.content}
        </div>
      ))}
    </div>
  );
}

// Usage
const tabs = [
  { id: 'overview', label: 'Overview', icon: '📊', content: <Overview /> },
  { id: 'activity', label: 'Activity', icon: '📋', count: 12, content: <Activity /> },
  { id: 'settings', label: 'Settings', icon: '⚙️', content: <Settings /> },
  { id: 'billing', label: 'Billing', icon: '💳', disabled: true, content: null },
];

<Tabs tabs={tabs} defaultTab="overview" />
```

---

## 15. Interactive Features

---

### Machine Code 5: Build a Drag and Drop List

```jsx
import { useState, useRef } from 'react';

function DragDropList({ initialItems, onReorder }) {
  const [items, setItems] = useState(initialItems);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggedId, setDraggedId] = useState(null);

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setDraggedId(items[index].id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
    e.preventDefault();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const newItems = [...items];
    const draggedItemContent = newItems.splice(dragItem.current, 1)[0];
    newItems.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggedId(null);
    setItems(newItems);
    onReorder?.(newItems);
  };

  return (
    <ul className="drag-list" onDragOver={handleDragOver}>
      {items.map((item, index) => (
        <li
          key={item.id}
          draggable
          onDragStart={e => handleDragStart(e, index)}
          onDragEnter={e => handleDragEnter(e, index)}
          onDrop={handleDrop}
          onDragEnd={() => setDraggedId(null)}
          className={`drag-item ${draggedId === item.id ? 'dragging' : ''}`}
          style={{
            opacity: draggedId === item.id ? 0.5 : 1,
            cursor: 'grab',
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            marginBottom: '8px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            listStyle: 'none',
            transition: 'opacity 0.2s',
          }}
        >
          <span aria-hidden="true" style={{ color: '#999', cursor: 'grab' }}>⠿</span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

// Usage
const initialItems = [
  { id: 1, label: 'Item 1' },
  { id: 2, label: 'Item 2' },
  { id: 3, label: 'Item 3' },
  { id: 4, label: 'Item 4' },
];

<DragDropList initialItems={initialItems} onReorder={console.log} />
```

---

### Machine Code 6: Build an Autocomplete / Typeahead Component

```jsx
import { useState, useEffect, useRef, useCallback } from 'react';

function Autocomplete({ fetchSuggestions, onSelect, placeholder = 'Search...' }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounceTimer = useRef(null);

  const search = useCallback(async (value) => {
    if (!value.trim()) { setSuggestions([]); setIsOpen(false); return; }
    setLoading(true);
    const results = await fetchSuggestions(value);
    setSuggestions(results);
    setIsOpen(results.length > 0);
    setActiveIndex(-1);
    setLoading(false);
  }, [fetchSuggestions]);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceTimer.current);
  }, [query, search]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleSelect = (item) => {
    setQuery(item.label || item);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect?.(item);
    inputRef.current?.focus();
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!inputRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0) {
      listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const listId = 'autocomplete-list';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query && suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `option-${activeIndex}` : undefined}
        style={{ width: '100%', padding: '10px 12px', fontSize: '16px',
          border: '1px solid #ddd', borderRadius: '8px' }}
      />
      {loading && <span style={{ position: 'absolute', right: '12px', top: '12px' }}>⟳</span>}

      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'white', border: '1px solid #ddd', borderTop: 'none',
            borderRadius: '0 0 8px 8px', maxHeight: '200px', overflowY: 'auto',
            zIndex: 100, margin: 0, padding: 0, listStyle: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {suggestions.map((item, index) => (
            <li
              key={item.id || index}
              id={`option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={() => handleSelect(item)}
              onMouseEnter={() => setActiveIndex(index)}
              style={{
                padding: '10px 12px', cursor: 'pointer', fontSize: '14px',
                background: index === activeIndex ? '#f0f4ff' : 'white',
              }}
            >
              {item.label || item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Usage
function SearchPage() {
  const fetchSuggestions = async (query) => {
    const res = await fetch(`/api/search?q=${query}`);
    return res.json();
  };

  return (
    <Autocomplete
      fetchSuggestions={fetchSuggestions}
      onSelect={item => console.log('Selected:', item)}
      placeholder="Search users..."
    />
  );
}
```

---

### Machine Code 7: Build a Kanban Board

```jsx
import { useState } from 'react';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: '#6366F1' },
  { id: 'in_progress', title: 'In Progress', color: '#F59E0B' },
  { id: 'review', title: 'Review', color: '#8B5CF6' },
  { id: 'done', title: 'Done', color: '#10B981' },
];

const INITIAL_TASKS = {
  todo: [{ id: '1', title: 'Design UI', priority: 'high' }],
  in_progress: [{ id: '2', title: 'Build API', priority: 'medium' }],
  review: [],
  done: [{ id: '3', title: 'Setup project', priority: 'low' }],
};

function KanbanBoard() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [dragging, setDragging] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [addingTo, setAddingTo] = useState(null);

  const handleDragStart = (task, columnId) => {
    setDragging({ task, fromColumn: columnId });
  };

  const handleDrop = (toColumnId) => {
    if (!dragging || dragging.fromColumn === toColumnId) return;

    setTasks(prev => ({
      ...prev,
      [dragging.fromColumn]: prev[dragging.fromColumn].filter(t => t.id !== dragging.task.id),
      [toColumnId]: [...prev[toColumnId], dragging.task],
    }));
    setDragging(null);
  };

  const addTask = (columnId) => {
    if (!newTaskText.trim()) return;
    const newTask = { id: Date.now().toString(), title: newTaskText, priority: 'medium' };
    setTasks(prev => ({ ...prev, [columnId]: [...prev[columnId], newTask] }));
    setNewTaskText('');
    setAddingTo(null);
  };

  const deleteTask = (columnId, taskId) => {
    setTasks(prev => ({
      ...prev,
      [columnId]: prev[columnId].filter(t => t.id !== taskId),
    }));
  };

  const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#6B7280' };

  return (
    <div style={{ display: 'flex', gap: '16px', padding: '24px', overflowX: 'auto', minHeight: '100vh', background: '#F8FAFC' }}>
      {COLUMNS.map(col => (
        <div
          key={col.id}
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(col.id)}
          style={{ minWidth: '280px', background: '#F1F5F9', borderRadius: '12px', padding: '12px' }}
        >
          {/* Column header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{col.title}</h3>
            <span style={{ marginLeft: 'auto', background: '#E2E8F0', borderRadius: '99px',
              padding: '2px 8px', fontSize: '12px' }}>
              {tasks[col.id].length}
            </span>
          </div>

          {/* Task cards */}
          {tasks[col.id].map(task => (
            <div
              key={task.id}
              draggable
              onDragStart={() => handleDragStart(task, col.id)}
              style={{
                background: 'white', borderRadius: '8px', padding: '12px',
                marginBottom: '8px', cursor: 'grab', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                opacity: dragging?.task.id === task.id ? 0.5 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{task.title}</p>
                <button
                  onClick={() => deleteTask(col.id, task.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '16px' }}
                >
                  ✕
                </button>
              </div>
              <span style={{ fontSize: '11px', color: PRIORITY_COLORS[task.priority], fontWeight: '600', textTransform: 'uppercase' }}>
                ● {task.priority}
              </span>
            </div>
          ))}

          {/* Add task */}
          {addingTo === col.id ? (
            <div style={{ background: 'white', borderRadius: '8px', padding: '8px' }}>
              <input
                autoFocus
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addTask(col.id); if (e.key === 'Escape') setAddingTo(null); }}
                placeholder="Task title..."
                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <button onClick={() => addTask(col.id)} style={{ background: col.color, color: 'white',
                  border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '13px' }}>
                  Add
                </button>
                <button onClick={() => setAddingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingTo(col.id)}
              style={{ width: '100%', background: 'none', border: '1px dashed #CBD5E1',
                borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#94A3B8', fontSize: '13px' }}
            >
              + Add task
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 16. Data & API Problems

---

### Machine Code 8: Build a Paginated Data Table with API

```jsx
import { useState, useEffect, useMemo } from 'react';

function DataTable({ apiUrl, columns, pageSize = 10 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortDir]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page, limit: pageSize, search,
      ...(sortBy && { sortBy, sortDir }),
    });

    fetch(`${apiUrl}?${params}`, { signal: controller.signal })
      .then(r => r.json())
      .then(({ data, total }) => { setData(data); setTotal(total); setLoading(false); })
      .catch(err => { if (err.name !== 'AbortError') { setError(err.message); setLoading(false); } });

    return () => controller.abort();
  }, [apiUrl, page, pageSize, search, sortBy, sortDir]);

  const totalPages = Math.ceil(total / pageSize);

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
  };

  return (
    <div>
      <input
        type="search"
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        placeholder="Search..."
        style={{ marginBottom: '12px', padding: '8px 12px', width: '300px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '6px' }}
      />

      {error && <div style={{ color: 'red', marginBottom: '12px' }}>Error: {error}</div>}

      <div style={{ position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            Loading...
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #E2E8F0',
                    cursor: col.sortable !== false ? 'pointer' : 'default', fontWeight: '600', color: '#374151' }}
                >
                  {col.label}
                  {sortBy === col.key && <span> {sortDir === 'asc' ? '↑' : '↓'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '12px 16px', color: '#4B5563' }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          {total} results • Page {page} of {totalPages}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
            return (
              <button key={p} onClick={() => setPage(p)}
                style={{ fontWeight: page === p ? '700' : '400' }}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        </div>
      </div>
    </div>
  );
}
```

---

## 17. Real-World App Features

---

### Machine Code 9: Build a Real-Time Chat Interface

```jsx
import { useState, useEffect, useRef, useCallback } from 'react';

function ChatInterface({ userId, roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://api.example.com/chat/${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (e) => {
      const payload = JSON.parse(e.data);
      switch (payload.type) {
        case 'message':
          setMessages(prev => [...prev, payload.data]);
          break;
        case 'typing':
          setIsTyping(prev => ({ ...prev, [payload.userId]: payload.isTyping }));
          if (payload.isTyping) {
            setTimeout(() => setIsTyping(prev => ({ ...prev, [payload.userId]: false })), 3000);
          }
          break;
        case 'history':
          setMessages(payload.data);
          break;
      }
    };

    return () => ws.close();
  }, [roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !connected) return;

    const message = {
      id: Date.now(),
      text: input.trim(),
      userId,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [...prev, message]);
    wsRef.current?.send(JSON.stringify({ type: 'message', data: message }));
    setInput('');
  }, [input, userId, connected]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    wsRef.current?.send(JSON.stringify({ type: 'typing', userId, isTyping: true }));
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      wsRef.current?.send(JSON.stringify({ type: 'typing', userId, isTyping: false }));
    }, 1000);
  };

  const typingUsers = Object.entries(isTyping).filter(([uid, t]) => t && uid !== userId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#10B981' : '#EF4444' }} />
        <span style={{ fontSize: '14px', color: '#6B7280' }}>{connected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: msg.userId === userId ? 'row-reverse' : 'row', gap: '8px' }}>
            <div style={{
              maxWidth: '70%', padding: '10px 14px', borderRadius: '12px', fontSize: '14px',
              background: msg.userId === userId ? '#6366F1' : '#F1F5F9',
              color: msg.userId === userId ? 'white' : '#111827',
            }}>
              <p style={{ margin: 0 }}>{msg.text}</p>
              <span style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px', display: 'block' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
                {msg.userId === userId && msg.status === 'sending' && ' ·'}
              </span>
            </div>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic' }}>
            {typingUsers.length === 1 ? `Someone is typing...` : `${typingUsers.length} people are typing...`}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={handleTyping}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="Type a message..."
          disabled={!connected}
          style={{ flex: 1, padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || !connected}
          style={{ padding: '10px 20px', background: '#6366F1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

---

## 18. Advanced Machine Coding

---

### Machine Code 10: Build a Custom useQuery Hook

```jsx
import { useState, useEffect, useRef, useCallback } from 'react';

function useQuery({ queryKey, queryFn, enabled = true, staleTime = 0, retry = 1, onSuccess, onError }) {
  const [state, setState] = useState({ data: undefined, error: null, status: 'idle' });
  const cache = useRef({});
  const abortRef = useRef(null);
  const retryCount = useRef(0);

  const cacheKey = JSON.stringify(queryKey);

  const fetchData = useCallback(async () => {
    // Check cache
    const cached = cache.current[cacheKey];
    if (cached && Date.now() - cached.timestamp < staleTime) {
      setState({ data: cached.data, error: null, status: 'success' });
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState(prev => ({ ...prev, status: prev.data ? 'refreshing' : 'loading' }));

    const attempt = async () => {
      try {
        const data = await queryFn({ signal: abortRef.current.signal });
        cache.current[cacheKey] = { data, timestamp: Date.now() };
        setState({ data, error: null, status: 'success' });
        retryCount.current = 0;
        onSuccess?.(data);
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (retryCount.current < retry) {
          retryCount.current++;
          setTimeout(attempt, 1000 * retryCount.current); // Exponential backoff
        } else {
          setState({ data: undefined, error, status: 'error' });
          onError?.(error);
        }
      }
    };

    attempt();
  }, [cacheKey, queryFn, staleTime, retry]);

  useEffect(() => {
    if (!enabled) return;
    fetchData();
    return () => abortRef.current?.abort();
  }, [cacheKey, enabled]);

  const refetch = useCallback(() => {
    delete cache.current[cacheKey]; // Invalidate cache
    fetchData();
  }, [cacheKey, fetchData]);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.status === 'loading',
    isRefreshing: state.status === 'refreshing',
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
    refetch,
  };
}

// Usage
function UserProfile({ userId }) {
  const { data: user, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!userId,
    onSuccess: (data) => console.log('User loaded:', data.name),
  });

  if (isLoading) return <Skeleton />;
  if (isError) return <div>Error: {error.message} <button onClick={refetch}>Retry</button></div>;
  return <div>{user?.name}</div>;
}
```

---

### Machine Code 11: Build an Undo/Redo System

```jsx
import { useReducer, useCallback } from 'react';

function useUndoRedo(initialState) {
  const [history, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'SET': {
          const newHistory = state.past.concat(state.present);
          return {
            past: newHistory.slice(-50), // Keep last 50 states
            present: action.payload,
            future: [],
          };
        }
        case 'UNDO': {
          if (state.past.length === 0) return state;
          const previous = state.past[state.past.length - 1];
          return {
            past: state.past.slice(0, -1),
            present: previous,
            future: [state.present, ...state.future],
          };
        }
        case 'REDO': {
          if (state.future.length === 0) return state;
          const next = state.future[0];
          return {
            past: [...state.past, state.present],
            present: next,
            future: state.future.slice(1),
          };
        }
        case 'RESET':
          return { past: [], present: initialState, future: [] };
        default:
          return state;
      }
    },
    { past: [], present: initialState, future: [] }
  );

  const setState = useCallback((value) => {
    dispatch({ type: 'SET', payload: typeof value === 'function' ? value(history.present) : value });
  }, [history.present]);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    historyLength: history.past.length,
  };
}

// Usage — Text Editor with undo/redo
function TextEditor() {
  const { state: text, setState, undo, redo, canUndo, canRedo } = useUndoRedo('');

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button onClick={undo} disabled={!canUndo}>↩ Undo</button>
        <button onClick={redo} disabled={!canRedo}>↪ Redo</button>
      </div>
      <textarea
        value={text}
        onChange={e => setState(e.target.value)}
        rows={10}
        style={{ width: '100%', padding: '12px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '8px' }}
        placeholder="Start typing... (Ctrl+Z to undo, Ctrl+Shift+Z to redo)"
      />
    </div>
  );
}
```

---

### Machine Code 12: Build an OTP Input Component

```jsx
import { useRef, useState } from 'react';

function OTPInput({ length = 6, onComplete }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const inputs = useRef([]);

  const focusNext = (index) => inputs.current[index + 1]?.focus();
  const focusPrev = (index) => inputs.current[index - 1]?.focus();

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // Numbers only
    if (!val) return;

    const newValues = [...values];

    // Handle paste — fill multiple boxes
    if (val.length > 1) {
      const chars = val.split('').slice(0, length - index);
      chars.forEach((char, i) => { if (index + i < length) newValues[index + i] = char; });
      setValues(newValues);
      const nextIndex = Math.min(index + chars.length, length - 1);
      inputs.current[nextIndex]?.focus();
    } else {
      newValues[index] = val;
      setValues(newValues);
      if (index < length - 1) focusNext(index);
    }

    const otp = newValues.join('');
    if (otp.length === length && !newValues.includes('')) {
      onComplete?.(otp);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValues = [...values];
      if (values[index]) {
        newValues[index] = '';
        setValues(newValues);
      } else if (index > 0) {
        newValues[index - 1] = '';
        setValues(newValues);
        focusPrev(index);
      }
    } else if (e.key === 'ArrowLeft') focusPrev(index);
    else if (e.key === 'ArrowRight') focusNext(index);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    const newValues = [...values];
    pasted.split('').forEach((char, i) => { newValues[i] = char; });
    setValues(newValues);
    const lastFilled = Math.min(pasted.length, length - 1);
    inputs.current[lastFilled]?.focus();
    if (pasted.length === length) onComplete?.(pasted);
  };

  const isComplete = values.every(v => v !== '');

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {values.map((val, i) => (
          <input
            key={i}
            ref={el => inputs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={e => handleChange(e, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            onPaste={handlePaste}
            onFocus={e => e.target.select()}
            aria-label={`OTP digit ${i + 1}`}
            style={{
              width: '52px', height: '60px', textAlign: 'center', fontSize: '24px',
              fontWeight: '700', border: `2px solid ${val ? '#6366F1' : '#E2E8F0'}`,
              borderRadius: '12px', outline: 'none', transition: 'border-color 0.2s',
              background: val ? '#EEF2FF' : 'white',
            }}
          />
        ))}
      </div>
      {isComplete && (
        <p style={{ textAlign: 'center', color: '#10B981', marginTop: '12px', fontSize: '14px' }}>
          ✓ OTP complete: {values.join('')}
        </p>
      )}
    </div>
  );
}

// Usage
function VerifyPage() {
  const handleOTPComplete = (otp) => {
    console.log('Verifying OTP:', otp);
    verifyOTP(otp);
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Enter verification code</h2>
      <p>We sent a 6-digit code to your email</p>
      <OTPInput length={6} onComplete={handleOTPComplete} />
    </div>
  );
}
```

---

### Quick Cheatsheet — What Interviewers Look For

```
Component Design         State Management        Performance
────────────────         ────────────────        ───────────
✅ Reusability           ✅ Right tool choice     ✅ React.memo
✅ Prop API design       ✅ Lift state correctly  ✅ useCallback
✅ Composition over      ✅ Avoid over-state      ✅ useMemo
   inheritance          ✅ useReducer for         ✅ Code splitting
✅ Default props            complex state        ✅ Virtualization
✅ Accessibility (a11y) ✅ Avoid mutation         ✅ Debounce
✅ Error states         ✅ Immutable updates      ✅ Lazy loading

Hooks                    Machine Coding          Common Mistakes
─────                    ──────────────          ───────────────
✅ Correct deps array    ✅ Works correctly       ❌ Mutating state
✅ Cleanup functions     ✅ Edge cases handled    ❌ Missing keys
✅ Custom hooks for      ✅ Accessibility         ❌ useEffect deps
   reuse                ✅ Keyboard support      ❌ Memory leaks
✅ No stale closures     ✅ Loading/error states  ❌ prop drilling
✅ Right hook for        ✅ Clean code            ❌ Infinite loops
   the job              ✅ Performance aware      ❌ Missing cleanup
```

---

*This document covers 27 scenario-based questions and 12 full machine coding challenges across all major React interview topics.*
