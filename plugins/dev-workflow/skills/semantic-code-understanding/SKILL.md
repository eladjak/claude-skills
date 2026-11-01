---
name: semantic-code-understanding
description: "Deep semantic code understanding using LSP and AST analysis for relationships, types, dependencies, and architectural patterns. Use when exploring complex codebases, analyzing dependencies, performing safe refactoring, detecting circular dependencies, or generating architectural documentation."
---

# Semantic Code Understanding Skill

Go beyond text search to understand code semantically through relationships, types, and context.

## When to Use This Skill

Activate this skill when you need to:
- Understand complex codebases quickly
- Find architectural patterns and anti-patterns
- Analyze code relationships and dependencies
- Refactor large systems safely
- Generate architectural documentation
- Identify technical debt and improvement opportunities

## The Revolution: From Text Search to Semantic Understanding

### The Old Way (Text Search)
```
Tools: grep, ripgrep, find
Method: Search for string patterns
Speed: ~45 seconds for "find all uses of login"
Understanding: Zero - just matching text
False Positives: Many (comments, strings, variable names)
Context: None
```

### The New Way (Semantic Understanding)
```
Tools: LSP (Language Server Protocol)
Method: Parse code into semantic graph
Speed: ~50 milliseconds for "find all uses of login"
Performance: 900x FASTER
Understanding: Full - knows types, scopes, relationships
False Positives: Zero - only actual code references
Context: Complete - scopes, imports, types, hierarchies
```

## Capabilities

### 1. Relationship Understanding

**Function Calls:**
```typescript
// Text search: "login" finds 47 matches (includes comments, strings)
// Semantic: Finds exactly 12 actual function calls to login()

function authenticate(user: User) {
  return login(user.email, user.password);  // ← Found
}

// "login" in comment ← Ignored
const url = "/api/login"; // ← Ignored
```

**Import/Export Chains:**
```
Trace the complete flow:
utils/auth.ts exports login()
  ↓
services/user.ts imports and re-exports
  ↓
controllers/auth.ts imports and uses
  ↓
routes/api.ts registers endpoint
```

**Type Hierarchies:**
```typescript
interface Animal { }
interface Mammal extends Animal { }
class Dog implements Mammal { }

// Semantic understanding:
// - Dog is a Mammal
// - Dog is an Animal
// - Find all implementations of Animal → [Dog, Cat, Bird]
// - Find all classes extending Mammal → [Dog, Cat]
```

### 2. Dependency Analysis

**Direct Dependencies:**
```
AuthService depends on:
- DatabaseService (database.ts)
- LoggerService (logger.ts)
- ConfigService (config.ts)
```

**Transitive Dependencies:**
```
AuthService → DatabaseService → ConnectionPool → NetDriver
(Entire dependency chain visible)
```

**Reverse Dependencies:**
```
Who uses AuthService?
- LoginController
- RegisterController
- PasswordResetController
- SessionMiddleware
```

**Circular Dependencies:**
```
UserService → OrderService → UserService
(Detected and warned automatically)
```

### 3. Scope and Context

**Variable Scopes:**
```typescript
const username = "global";  // Global scope

function outer() {
  const username = "outer"; // Function scope

  function inner() {
    const username = "inner"; // Nested scope
    console.log(username); // Which one? Semantic knows!
  }
}

// Semantic understanding knows which 'username' is referenced
// Text search just finds all three
```

**Namespace Resolution:**
```typescript
import { User as AuthUser } from './auth';
import { User as DBUser } from './database';

const user: AuthUser = new AuthUser(); // ← Semantic knows this is AuthUser
const record: DBUser = fetchUser(); // ← Semantic knows this is DBUser

// Text search: "User" finds both (ambiguous)
// Semantic: Knows exactly which User type
```

### 4. Type Flow Analysis

**Type Propagation:**
```typescript
function getUser(id: number): Promise<User> { }

const userPromise = getUser(123);
// Semantic knows: userPromise is Promise<User>

const user = await userPromise;
// Semantic knows: user is User

const name = user.name;
// Semantic knows: name is string
```

**Type Guards:**
```typescript
function process(value: string | number) {
  if (typeof value === "string") {
    // Semantic knows: value is string here
    value.toUpperCase(); // ✓ Valid
  } else {
    // Semantic knows: value is number here
    value.toFixed(2); // ✓ Valid
  }
}
```

## Use Cases

### 1. Codebase Exploration

**Question: "How does authentication work?"**

Text Search Approach:
```bash
grep -r "auth" .
# Returns 347 matches across 52 files
# Includes: authenticate, author, authorization, etc.
# No understanding of relationships
```

Semantic Approach:
```
LSP Analysis:
1. Find AuthService class definition
2. Map all methods: login(), logout(), refresh()
3. Trace login() flow:
   - Calls validateCredentials()
   - Calls TokenService.generate()
   - Updates UserSession
4. Identify all consumers of AuthService
5. Generate call graph visualization

Result: Complete understanding in 2 seconds
```

### 2. Safe Refactoring

**Task: Rename getUserData → fetchUserProfile**

Text Search (Dangerous):
```bash
# Find and replace
sed -i 's/getUserData/fetchUserProfile/g' **/*.ts

# Problems:
# - Changes "getUserDataFromCache" → "fetchUserProfileFromCache"
# - Changes strings: "Call getUserData first"
# - Changes comments
# - Misses dynamic calls
```

Semantic (Safe):
```
LSP Rename Symbol:
1. Find function definition
2. Find all references (actual calls only)
3. Update definition + all 23 references
4. Preserve unrelated occurrences
5. Update imports automatically
6. Maintain type safety

Result: Perfect refactoring, zero errors
```

### 3. Architectural Analysis

**Task: Identify circular dependencies**

Manual (Weeks):
```
1. Draw dependency graph by hand
2. Trace each import chain
3. Look for cycles
4. Miss many due to complexity
```

Semantic (Seconds):
```
LSP Dependency Analysis:
- Parse all import statements
- Build dependency graph
- Detect cycles using graph algorithms
- Report: 3 circular dependencies found
  1. UserService ↔ OrderService
  2. AuthController ↔ SessionManager
  3. Database ↔ Migration

Result: Complete analysis in 5 seconds
```

### 4. Code Generation

**Task: Generate TypeScript types from API**

Text-Based (Error-Prone):
```
Parse JSON response strings
Guess types from examples
Manually write interfaces
Hope you didn't miss optional fields
```

Semantic (Accurate):
```
1. Analyze actual API response structure
2. Infer types from usage patterns
3. Detect optional vs required fields
4. Generate proper TypeScript interfaces
5. Validate against existing types
6. Ensure consistency across codebase

Result: Type-safe, validated interfaces
```

### 5. Documentation Generation

**Task: Document a complex module**

Manual (Hours):
```
Read code line by line
Understand relationships
Write documentation
Keep it updated (never happens)
```

Semantic (Automated):
```
LSP Analysis:
1. Extract all public APIs
2. Generate type signatures
3. Find usage examples from tests
4. Map dependencies and relationships
5. Generate Markdown documentation
6. Include call graphs and diagrams

Result: Complete, accurate docs in 1 minute
```

## Semantic Understanding vs Other Approaches

| Approach | Speed | Accuracy | Context | Use Case |
|----------|-------|----------|---------|----------|
| **grep/ripgrep** | Slow (45s) | 40% | None | Quick searches |
| **AST Parsing** | Medium (5s) | 70% | Limited | Syntax analysis |
| **LSP Semantic** | Fast (50ms) | 99% | Full | Everything |
| **RAG (Embeddings)** | Medium (2s) | 80% | Partial | Natural language |

## Integration Patterns

### Pattern 1: Semantic + MCP
```
1. LSP: Analyze which files changed
2. Semantic: Identify affected modules
3. MCP GitHub: Fetch related PRs
4. Semantic: Check for breaking changes
5. MCP Slack: Alert affected teams
```

### Pattern 2: Semantic + Multi-Agent
```
1. Architect Agent: Semantic analysis of architecture
2. Coder Agent: Implement following patterns
3. Reviewer Agent: Semantic validation
4. Deploy Agent: Risk assessment via semantic diff
```

### Pattern 3: Semantic + RAG
```
1. RAG: "Find files related to authentication"
2. Semantic: Narrow to actual AuthService usage
3. RAG: Understand business logic
4. Semantic: Generate type-safe implementation
```

## Best Practices

### 1. Always Use Semantic for Refactoring
```
❌ Find and replace (text)
✅ LSP Rename Symbol (semantic)

❌ Manual import updates
✅ LSP Auto-import (semantic)

❌ Regex-based code modification
✅ LSP Code Actions (semantic)
```

### 2. Trust Semantic Over Text
```
When in doubt:
- Semantic understanding is authoritative
- Text search is supplementary
- Never refactor with regex on semantic code
```

### 3. Leverage Type Information
```
Use semantic understanding to:
- Validate API contracts
- Ensure type safety in refactors
- Detect type mismatches early
- Generate accurate documentation
```

### 4. Combine Approaches
```
Semantic: Precise code operations
RAG: Natural language understanding
Text Search: Quick checks
Together: Comprehensive solution
```

## Tools and Languages

### Supported Languages (LSP)
1. **Python**: Pyright, Pylance
2. **TypeScript/JavaScript**: tsserver
3. **Rust**: rust-analyzer
4. **Go**: gopls
5. **Java**: Eclipse JDT
6. **C++**: clangd
7. **C#**: OmniSharp
8. **PHP**: Intelephense
9. **Kotlin**: kotlin-language-server
10. **Ruby**: solargraph
11. **HTML**: html-languageserver

### IDE Integration
- **Claude Code**: Native LSP integration
- **VS Code**: Built-in LSP support
- **Cursor**: LSP + AI features
- **Neovim**: LSP client built-in
- **Emacs**: lsp-mode

## Performance Characteristics

### Initialization
- **First Run**: 5-30 seconds (index codebase)
- **Subsequent**: Instant (cached)
- **Large Projects** (100k+ files): 1-2 minutes initial
- **Incremental Updates**: Real-time

### Query Speed
- **Go to Definition**: <50ms
- **Find References**: <100ms
- **Rename Symbol**: <200ms
- **Hover Info**: <10ms
- **Diagnostics**: Real-time

### Resource Usage
- **Memory**: 100-500MB (varies by project size)
- **CPU**: Low (5-10% during active use)
- **Disk**: Minimal (only for cache)

## Limitations

### When Semantic Understanding Struggles
1. **Dynamic Languages**: Less precise for Python/Ruby vs TypeScript
2. **Reflection/Metaprogramming**: Hard to analyze dynamically generated code
3. **Multiple Versions**: If codebase has conflicting definitions
4. **Incomplete Projects**: Needs compilable/parsable code

### Fallback Strategies
```
If LSP unavailable or fails:
1. Use AST parsing (syntax-level)
2. Fall back to enhanced text search
3. Combine multiple approaches
4. Request human clarification
```

## The Future: Semantic AI

**From "Chatbots that Guess" to "Agents that Know":**

Old Model (Text-Based):
```
User: "Find all login functions"
AI: *searches for string "login"*
AI: *returns 347 text matches*
AI: *guesses which ones are functions*
```

New Model (Semantic):
```
User: "Find all login functions"
AI: *uses LSP to query semantic graph*
AI: *returns 3 actual function definitions*
AI: *includes call graphs and usage patterns*
AI: *understands relationship to auth system*
```

**This is 900x faster and infinitely more accurate.**

## Resources

- **LSP Specification**: microsoft.github.io/language-server-protocol
- **Claude Code LSP**: code.claude.com/docs/lsp
- **Language Servers**: langserver.org
- **Semantic Analysis**: sourcegraph.com/blog/semantic-analysis
- **Type Theory**: learnyouahaskell.com/types-and-typeclasses
