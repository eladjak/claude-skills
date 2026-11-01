---
name: security-patterns
description: "Security patterns and best practices"
---

# Security Patterns

## Input Validation

### Zod Schema
```typescript
const UserInput = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  age: z.number().int().positive().optional()
})

// Validate
const result = UserInput.safeParse(input)
if (!result.success) {
  return { error: result.error.flatten() }
}
```

## SQL Injection Prevention

```typescript
// ❌ NEVER - String concatenation
const query = `SELECT * FROM users WHERE id = '${id}'`

// ✅ ALWAYS - Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', id)

// ✅ ALWAYS - Prepared statement
await db.query('SELECT * FROM users WHERE id = $1', [id])
```

## XSS Prevention

```tsx
// ❌ NEVER - Unescaped HTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ ALWAYS - React auto-escapes
<div>{userContent}</div>

// ✅ If HTML needed - Sanitize first
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

## Authentication

### Password Hashing
```typescript
import { hash, verify } from '@node-rs/argon2'

// Hash
const hashed = await hash(password)

// Verify
const valid = await verify(hashed, password)
```

### JWT Handling
```typescript
// Sign
const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' })

// Verify
const payload = jwt.verify(token, secret)
```

## Authorization

```typescript
// Check ownership
if (post.userId !== currentUser.id) {
  throw new ForbiddenError('Not authorized')
}

// Role-based
if (!user.roles.includes('admin')) {
  throw new ForbiddenError('Admin required')
}
```

## Secrets Management

```typescript
// ❌ NEVER
const apiKey = 'YOUR_API_KEY'

// ✅ ALWAYS
const apiKey = process.env.API_KEY
if (!apiKey) throw new Error('API_KEY required')
```

## Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(10, '10 s')
})

const { success } = await ratelimit.limit(userId)
if (!success) {
  return new Response('Too many requests', { status: 429 })
}
```

## Headers

```typescript
// Security headers
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': "default-src 'self'"
}
```
