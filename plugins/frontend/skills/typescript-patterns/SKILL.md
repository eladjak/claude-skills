---
name: typescript-patterns
description: "TypeScript patterns and best practices"
---

# TypeScript Patterns

## Type vs Interface

```typescript
// Interface - for objects, extendable
interface User {
  id: string
  name: string
}

// Type - for unions, primitives, complex
type Status = 'pending' | 'active' | 'done'
type Handler<T> = (data: T) => void
```

## Utility Types

```typescript
// Partial - all optional
Partial<User>

// Required - all required
Required<User>

// Pick - select fields
Pick<User, 'id' | 'name'>

// Omit - exclude fields
Omit<User, 'password'>

// Record - key-value map
Record<string, User>

// ReturnType - function return
ReturnType<typeof myFunc>

// Parameters - function params
Parameters<typeof myFunc>
```

## Generic Patterns

```typescript
// Function generic
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

// Interface generic
interface ApiResponse<T> {
  data: T
  error?: string
}

// Constrained generic
function merge<T extends object>(a: T, b: T): T {
  return { ...a, ...b }
}
```

## Type Guards

```typescript
// typeof
if (typeof x === 'string') { ... }

// instanceof
if (x instanceof Error) { ... }

// Custom guard
function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && 'id' in x
}
```

## Discriminated Unions

```typescript
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

function handle(result: Result<User, Error>) {
  if (result.ok) {
    // result.value is User
  } else {
    // result.error is Error
  }
}
```

## Const Assertions

```typescript
// Literal types
const config = {
  api: '/api',
  version: 1
} as const

// Tuple types
const tuple = [1, 'two'] as const
```

## Template Literal Types

```typescript
type Route = `/api/${string}`
type EventName = `on${Capitalize<string>}`
```
