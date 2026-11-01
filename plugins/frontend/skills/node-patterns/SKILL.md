---
name: node-patterns
description: "Node.js patterns and best practices"
---

# Node.js Patterns

## File System

```typescript
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

// Read file
const content = await readFile('file.txt', 'utf-8')

// Write file
await writeFile('file.txt', content)

// Ensure directory exists
if (!existsSync(dir)) {
  await mkdir(dir, { recursive: true })
}

// Join paths safely
const filePath = join(process.cwd(), 'data', 'file.json')
```

## Environment Variables

```typescript
// Load .env
import 'dotenv/config'

// Validate required vars
const requiredEnv = ['DATABASE_URL', 'API_KEY'] as const

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing env var: ${key}`)
  }
}

// Type-safe env
const config = {
  dbUrl: process.env.DATABASE_URL!,
  apiKey: process.env.API_KEY!,
  port: parseInt(process.env.PORT || '3000')
}
```

## HTTP Server

```typescript
import { createServer } from 'http'

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'ok' }))
})

server.listen(3000)
```

## Process Handling

```typescript
// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...')
  await cleanup()
  process.exit(0)
})

// Uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled:', reason)
  process.exit(1)
})
```

## Streams

```typescript
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { createGzip } from 'zlib'

// Compress file
await pipeline(
  createReadStream('input.txt'),
  createGzip(),
  createWriteStream('output.txt.gz')
)
```

## Worker Threads

```typescript
import { Worker, isMainThread, parentPort } from 'worker_threads'

if (isMainThread) {
  const worker = new Worker(__filename)
  worker.on('message', (msg) => console.log(msg))
  worker.postMessage('start')
} else {
  parentPort?.on('message', (msg) => {
    // Heavy computation
    parentPort?.postMessage('done')
  })
}
```

## Async Patterns

```typescript
// Promise.all for parallel
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
])

// Promise.allSettled for independent
const results = await Promise.allSettled([
  task1(),
  task2()
])

// Sequential with for...of
for (const item of items) {
  await processItem(item)
}
```
