---
name: testing-patterns
description: "Testing patterns and best practices"
---

# Testing Patterns

## Test Structure (AAA)

```typescript
test('should do something', () => {
  // Arrange
  const input = 'test'

  // Act
  const result = myFunction(input)

  // Assert
  expect(result).toBe('expected')
})
```

## Naming Convention

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {})
    it('should throw on duplicate email', () => {})
    it('should hash password before saving', () => {})
  })
})
```

## Mocking

```typescript
// Mock function
const mockFn = vi.fn()
mockFn.mockReturnValue('value')
mockFn.mockResolvedValue('async value')

// Mock module
vi.mock('./module', () => ({
  myFunction: vi.fn()
}))

// Spy
const spy = vi.spyOn(object, 'method')
```

## Async Testing

```typescript
// Async/await
test('async test', async () => {
  const result = await fetchData()
  expect(result).toBeDefined()
})

// Resolved value
test('promise', async () => {
  await expect(fetchData()).resolves.toBe('data')
})

// Rejected value
test('error', async () => {
  await expect(fetchData()).rejects.toThrow('error')
})
```

## React Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

test('button click', async () => {
  render(<Button onClick={mockFn}>Click</Button>)

  await fireEvent.click(screen.getByText('Click'))

  expect(mockFn).toHaveBeenCalled()
})
```

## Test Types

| Type | Scope | Speed |
|------|-------|-------|
| Unit | Single function | Fast |
| Integration | Multiple units | Medium |
| E2E | Full flow | Slow |

## Coverage Goals

- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Critical paths: 100%

## Anti-Patterns

- Testing implementation details
- Flaky tests (time-dependent)
- Too many mocks
- Testing framework code
- No assertions
