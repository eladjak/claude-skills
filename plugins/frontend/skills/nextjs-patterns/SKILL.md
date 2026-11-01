---
name: nextjs-patterns
description: "Next.js App Router patterns"
---

# Next.js Patterns

## File Conventions

| File | Purpose |
|------|---------|
| `page.tsx` | Route UI |
| `layout.tsx` | Shared layout |
| `loading.tsx` | Loading UI |
| `error.tsx` | Error UI |
| `not-found.tsx` | 404 page |
| `route.ts` | API endpoint |
| `template.tsx` | Re-rendered layout |
| `default.tsx` | Parallel route fallback |

## Server Components (Default)

```tsx
// This is a Server Component by default
async function Page() {
  const data = await db.query('SELECT * FROM users')
  return <UserList users={data} />
}
```

## Client Components

```tsx
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

## Data Fetching

### Server Component
```tsx
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache',  // Default: cached
    // cache: 'no-store',  // Always fresh
    // next: { revalidate: 60 }  // Revalidate every 60s
  })
  return <div>{data}</div>
}
```

### Server Actions
```tsx
'use server'

export async function createUser(formData: FormData) {
  const name = formData.get('name')
  await db.insert({ name })
  revalidatePath('/users')
}

// Usage
<form action={createUser}>
  <input name="name" />
  <button type="submit">Create</button>
</form>
```

## API Routes

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const users = await db.users.findMany()
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()
  const user = await db.users.create({ data: body })
  return NextResponse.json(user, { status: 201 })
}
```

## Metadata

```tsx
// Static
export const metadata = {
  title: 'My Page',
  description: 'Description'
}

// Dynamic
export async function generateMetadata({ params }) {
  const post = await getPost(params.id)
  return { title: post.title }
}
```

## Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  // Redirect
  if (condition) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rewrite
  return NextResponse.rewrite(new URL('/new-path', request.url))
}

export const config = {
  matcher: ['/protected/:path*']
}
```

## Parallel Routes

```
app/
├── @modal/
│   └── (.)photo/[id]/page.tsx
├── layout.tsx
└── page.tsx
```

```tsx
// layout.tsx
export default function Layout({ children, modal }) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```
