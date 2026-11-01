---
name: api-patterns
description: "API design patterns and best practices"
---

# API Patterns

## RESTful Design

### URL Structure
```
GET    /api/users          # List
GET    /api/users/:id      # Get one
POST   /api/users          # Create
PUT    /api/users/:id      # Replace
PATCH  /api/users/:id      # Update
DELETE /api/users/:id      # Delete
```

### Nested Resources
```
GET /api/users/:userId/posts
GET /api/posts/:postId/comments
```

## Response Format

### Success
```typescript
{
  success: true,
  data: T,
  meta?: {
    total: number,
    page: number,
    limit: number
  }
}
```

### Error
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: unknown
  }
}
```

## Status Codes

| Code | Use |
|------|-----|
| 200 | Success |
| 201 | Created |
| 204 | No content (delete) |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 422 | Validation error |
| 500 | Server error |

## Pagination

```typescript
// Query params
?page=1&limit=20

// Response
{
  data: [...],
  meta: {
    total: 100,
    page: 1,
    limit: 20,
    pages: 5
  }
}
```

## Filtering & Sorting

```
GET /api/users?status=active&sort=-createdAt
```

## Versioning

```
/api/v1/users
/api/v2/users
```

## Rate Limiting Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```
