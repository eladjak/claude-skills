---
name: zustand-patterns
description: "Zustand state management patterns"
---

# Zustand Patterns

## Basic Store

```typescript
import { create } from 'zustand'

interface CounterStore {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}))
```

## Usage

```tsx
function Counter() {
  // Select specific state (recommended)
  const count = useCounterStore((state) => state.count)
  const increment = useCounterStore((state) => state.increment)

  return <button onClick={increment}>{count}</button>
}

// Or destructure (re-renders on any change)
function Counter() {
  const { count, increment } = useCounterStore()
  return <button onClick={increment}>{count}</button>
}
```

## Async Actions

```typescript
interface UserStore {
  user: User | null
  loading: boolean
  fetchUser: (id: string) => Promise<void>
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: false,
  fetchUser: async (id) => {
    set({ loading: true })
    const user = await api.getUser(id)
    set({ user, loading: false })
  }
}))
```

## Persist Middleware

```typescript
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist<State>(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'app-storage', // localStorage key
      partialize: (state) => ({ theme: state.theme }) // Only persist theme
    }
  )
)
```

## Devtools

```typescript
import { devtools } from 'zustand/middleware'

export const useStore = create(
  devtools<State>(
    (set) => ({ ... }),
    { name: 'MyStore' }
  )
)
```

## Slices Pattern

```typescript
// slices/userSlice.ts
export const createUserSlice = (set) => ({
  user: null,
  setUser: (user) => set({ user })
})

// slices/settingsSlice.ts
export const createSettingsSlice = (set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme })
})

// store.ts
export const useStore = create((...a) => ({
  ...createUserSlice(...a),
  ...createSettingsSlice(...a)
}))
```

## Selectors

```typescript
// Create selector outside component
const selectCount = (state: Store) => state.count
const selectDoubleCount = (state: Store) => state.count * 2

// Use in component
const count = useStore(selectCount)
const double = useStore(selectDoubleCount)

// Shallow comparison for objects
import { shallow } from 'zustand/shallow'

const { name, email } = useStore(
  (state) => ({ name: state.name, email: state.email }),
  shallow
)
```

## Subscribe to Changes

```typescript
// Outside React
const unsubscribe = useStore.subscribe(
  (state) => state.count,
  (count) => console.log('Count changed:', count)
)

// Get state outside React
const count = useStore.getState().count
useStore.setState({ count: 10 })
```
