---
name: react-query-patterns
description: "TanStack Query (React Query) patterns"
---

# React Query Patterns

## Setup

```tsx
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
```

## Queries

### Basic Query
```tsx
function Users() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json())
  })

  if (isLoading) return <Loading />
  if (error) return <Error error={error} />
  return <UserList users={data} />
}
```

### With Parameters
```tsx
function User({ id }: { id: string }) {
  const { data } = useQuery({
    queryKey: ['users', id],
    queryFn: () => fetch(`/api/users/${id}`).then(r => r.json()),
    enabled: !!id // Only run if id exists
  })
}
```

### Dependent Queries
```tsx
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId)
})

const { data: posts } = useQuery({
  queryKey: ['posts', user?.id],
  queryFn: () => fetchPosts(user!.id),
  enabled: !!user?.id
})
```

## Mutations

```tsx
function CreateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (newUser: CreateUserInput) =>
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      }).then(r => r.json()),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },

    onError: (error) => {
      toast.error(error.message)
    }
  })

  return (
    <button
      onClick={() => mutation.mutate({ name: 'John' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Creating...' : 'Create User'}
    </button>
  )
}
```

## Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previousTodos = queryClient.getQueryData(['todos'])

    queryClient.setQueryData(['todos'], (old) =>
      old.map(t => t.id === newTodo.id ? newTodo : t)
    )

    return { previousTodos }
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }
})
```

## Infinite Queries

```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam }) => fetchPosts(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor
})

// Render
{data?.pages.map(page => page.items.map(item => <Item key={item.id} />))}
<button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
  Load More
</button>
```

## Prefetching

```tsx
// Prefetch on hover
<Link
  href={`/user/${id}`}
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: ['user', id],
      queryFn: () => fetchUser(id)
    })
  }}
>
  View User
</Link>
```
