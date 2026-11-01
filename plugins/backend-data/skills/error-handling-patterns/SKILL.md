---
name: error-handling-patterns
description: "Error handling patterns beyond better-result"
---

# Error Handling Patterns

## Custom Error Classes

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
}
```

## API Error Response

```typescript
function handleError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.statusCode }
    )
  }

  // Unknown error - don't leak details
  console.error('Unexpected error:', error)
  return Response.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
    { status: 500 }
  )
}
```

## React Error Boundary

```tsx
class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error boundary caught:', error, info)
    // Send to error tracking
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

## Async Error Handling

```typescript
// Wrapper for async route handlers
function asyncHandler(fn: Function) {
  return (req: Request) => {
    return Promise.resolve(fn(req)).catch(handleError)
  }
}

// Usage
export const GET = asyncHandler(async (req) => {
  const user = await getUser(req)
  if (!user) throw new NotFoundError('User')
  return Response.json(user)
})
```

## Form Error Handling

```typescript
type FormState = {
  errors: Record<string, string[]>
  message?: string
}

function validateForm(data: FormData): FormState {
  const errors: Record<string, string[]> = {}

  const email = data.get('email')
  if (!email) {
    errors.email = ['Email is required']
  } else if (!isValidEmail(email)) {
    errors.email = ['Invalid email format']
  }

  return {
    errors,
    message: Object.keys(errors).length > 0 ? 'Please fix the errors' : undefined
  }
}
```

## Retry Pattern

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, delay * (i + 1)))
      }
    }
  }

  throw lastError!
}

// Usage
const data = await withRetry(() => fetchAPI('/data'), 3, 1000)
```
