---
name: react-patterns
description: "React patterns and best practices"
---

# React Patterns

## Component Patterns

### Composition
```tsx
// Instead of prop drilling
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

### Render Props
```tsx
<DataFetcher url="/api/users">
  {({ data, loading }) =>
    loading ? <Spinner /> : <UserList users={data} />
  }
</DataFetcher>
```

### Custom Hooks
```tsx
function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser(id).then(setUser).finally(() => setLoading(false))
  }, [id])

  return { user, loading }
}
```

## State Management

### Local State
```tsx
const [count, setCount] = useState(0)
const [user, setUser] = useState<User | null>(null)
```

### Reducer for Complex State
```tsx
const [state, dispatch] = useReducer(reducer, initialState)
dispatch({ type: 'INCREMENT' })
```

### Context for Global State
```tsx
const ThemeContext = createContext<Theme>('light')

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  )
}
```

## Performance

### Memoization
```tsx
// Memoize component
const MemoizedList = React.memo(List)

// Memoize value
const filtered = useMemo(() =>
  items.filter(predicate), [items, predicate]
)

// Memoize callback
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

### Code Splitting
```tsx
const HeavyComponent = lazy(() => import('./HeavyComponent'))

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

## Forms

### Controlled
```tsx
const [value, setValue] = useState('')
<input value={value} onChange={e => setValue(e.target.value)} />
```

### With React Hook Form
```tsx
const { register, handleSubmit } = useForm<FormData>()
<input {...register('email', { required: true })} />
```

## Error Boundaries

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```
