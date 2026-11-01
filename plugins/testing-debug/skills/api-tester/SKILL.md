---
name: api-tester
description: Quick API endpoint testing from command line. Use when testing APIs, checking endpoints, or debugging HTTP requests. Triggers on test api, curl, http request, endpoint test.
---

# API Tester

Quick HTTP request testing.

## Commands

| Command | Description |
|---------|-------------|
| `/api-tester get <url>` | GET request |
| `/api-tester post <url>` | POST request |
| `/api-tester put <url>` | PUT request |
| `/api-tester delete <url>` | DELETE request |

## Options

- `-h` or `--headers` - Custom headers
- `-d` or `--data` - Request body
- `-v` or `--verbose` - Show full response

## Examples

```
/api-tester get https://api.example.com/users
/api-tester post https://api.example.com/users -d '{"name":"test"}'
```
