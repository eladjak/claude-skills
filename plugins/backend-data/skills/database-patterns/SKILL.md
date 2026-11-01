---
name: database-patterns
description: "Database patterns and best practices"
---

# Database Patterns

## Query Patterns

### Pagination
```sql
-- Offset pagination (simple, slow for large offsets)
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;

-- Cursor pagination (efficient)
SELECT * FROM posts
WHERE created_at < $cursor
ORDER BY created_at DESC
LIMIT 20;
```

### Search
```sql
-- Full text search (PostgreSQL)
SELECT * FROM posts
WHERE to_tsvector('english', title || ' ' || content)
      @@ plainto_tsquery('english', $query);

-- ILIKE (simple, slower)
SELECT * FROM posts
WHERE title ILIKE '%' || $query || '%';
```

### Aggregations
```sql
-- Count by status
SELECT status, COUNT(*) as count
FROM orders
GROUP BY status;

-- Sum with filter
SELECT
  SUM(amount) FILTER (WHERE status = 'completed') as completed,
  SUM(amount) FILTER (WHERE status = 'pending') as pending
FROM orders;
```

## Index Strategies

```sql
-- Single column
CREATE INDEX idx_users_email ON users(email);

-- Composite (order matters!)
CREATE INDEX idx_posts_user_date ON posts(user_id, created_at DESC);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE active = true;

-- Unique constraint
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
```

## Transaction Patterns

```typescript
// Supabase
const { error } = await supabase.rpc('transfer_funds', {
  from_id: 1,
  to_id: 2,
  amount: 100
})

// SQL function
CREATE FUNCTION transfer_funds(from_id INT, to_id INT, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE accounts SET balance = balance - amount WHERE id = from_id;
  UPDATE accounts SET balance = balance + amount WHERE id = to_id;
END;
$$ LANGUAGE plpgsql;
```

## Migration Strategy

```sql
-- Add column (safe)
ALTER TABLE users ADD COLUMN phone TEXT;

-- Add NOT NULL (two steps)
-- Step 1: Add nullable
ALTER TABLE users ADD COLUMN phone TEXT;
-- Step 2: Backfill
UPDATE users SET phone = '' WHERE phone IS NULL;
-- Step 3: Add constraint
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;

-- Rename column (careful!)
ALTER TABLE users RENAME COLUMN name TO full_name;
```

## N+1 Prevention

```typescript
// ❌ N+1 problem
const posts = await getPosts()
for (const post of posts) {
  post.author = await getUser(post.authorId)  // N queries!
}

// ✅ Single query with join
const posts = await supabase
  .from('posts')
  .select('*, author:users(*)')

// ✅ Batch query
const posts = await getPosts()
const authorIds = [...new Set(posts.map(p => p.authorId))]
const authors = await getUsers(authorIds)
const authorMap = new Map(authors.map(a => [a.id, a]))
posts.forEach(p => p.author = authorMap.get(p.authorId))
```
