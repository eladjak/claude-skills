---
name: vitest-patterns
description: "Vitest testing patterns"
---

# Vitest Patterns

## Setup

```bash
bun add -d vitest @testing-library/react @testing-library/jest-dom jsdom
```

## Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html']
    }
  }
})
```

## Setup File

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

## Basic Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('math', () => {
  it('should add numbers', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle arrays', () => {
    expect([1, 2, 3]).toContain(2)
    expect([1, 2, 3]).toHaveLength(3)
  })

  it('should handle objects', () => {
    expect({ a: 1 }).toEqual({ a: 1 })
    expect({ a: 1, b: 2 }).toMatchObject({ a: 1 })
  })
})
```

## Mocking

```typescript
import { vi, describe, it, expect } from 'vitest'

// Mock function
const mockFn = vi.fn()
mockFn.mockReturnValue('value')
mockFn.mockResolvedValue('async value')

// Mock module
vi.mock('./module', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'test' }))
}))

// Spy
const spy = vi.spyOn(object, 'method')

// Timer mocks
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
vi.useRealTimers()
```

## React Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)

    await fireEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

## Async Testing

```typescript
it('fetches data', async () => {
  render(<DataComponent />)

  // Wait for element
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })

  // Or use findBy (auto-waits)
  const element = await screen.findByText('Data loaded')
  expect(element).toBeInTheDocument()
})
```

## Hooks Testing

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increments', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

## Commands

```bash
# Run tests
bun test

# Watch mode
bun test --watch

# Coverage
bun test --coverage

# UI mode
bunx vitest --ui
```
