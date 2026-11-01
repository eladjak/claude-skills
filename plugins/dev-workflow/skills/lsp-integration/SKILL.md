---
name: lsp-integration
description: "Leverage Language Server Protocol for 900x faster semantic code navigation, refactoring, and understanding. Use when navigating codebases, finding references, renaming symbols, or performing type-safe refactoring. Supports 11 languages including TypeScript, Python, Rust, and Go."
---

# LSP Integration Skill

Enable AI to understand code structure 900x faster than text search using Language Server Protocol.

## When to Use This Skill

Activate this skill when you need to:
- Navigate complex codebases efficiently
- Find all references to a symbol across multiple files
- Perform intelligent refactoring with type safety
- Understand code relationships and dependencies
- Get instant "Go to Definition" functionality
- Validate types and catch errors before runtime

## Capabilities

### Semantic Understanding
- **900x faster than grep**: LSP provides instant semantic analysis
- **Relationship mapping**: Understand how functions, classes, and modules connect
- **Cross-file navigation**: Jump to definitions across your entire codebase
- **Real-time validation**: Type checking and error detection as you work

### Supported Languages (11)
1. Python (Pyright, Pylance)
2. Rust (rust-analyzer)
3. Go (gopls)
4. TypeScript/JavaScript (tsserver)
5. Java (Eclipse JDT)
6. C++ (clangd)
7. C# (OmniSharp)
8. PHP (Intelephense)
9. Kotlin (kotlin-language-server)
10. Ruby (solargraph)
11. HTML (html-languageserver)

### Operations
- **Go to Definition**: Find where symbols are defined
- **Find All References**: Locate every usage of a function/variable
- **Hover Information**: Get type info and documentation
- **Code Completion**: Context-aware suggestions
- **Rename Symbol**: Safe refactoring across files
- **Diagnostics**: Real-time error and warning detection

## How It Works

LSP creates a semantic understanding of your code by:
1. Parsing the entire codebase structure
2. Building a symbol graph with relationships
3. Maintaining an index for instant lookups
4. Providing context-aware responses in <50ms

Unlike text search (grep/ripgrep) which searches for string patterns, LSP understands:
- Scopes and namespaces
- Type hierarchies
- Import/export relationships
- Interface implementations
- Function signatures

## Use Cases

### 1. Refactoring Large Codebases
```
"Rename the getUserData function to fetchUserProfile across the entire project"
→ LSP safely renames all references while preserving functionality
```

### 2. Understanding Dependencies
```
"Show me all files that import the AuthService class"
→ LSP instantly returns the complete dependency tree
```

### 3. Type-Safe Transformations
```
"Change the return type of calculateTotal from number to Promise<number>"
→ LSP identifies all call sites that need updating
```

### 4. Code Navigation
```
"Find the implementation of the login method"
→ LSP jumps directly to the definition, even in imported modules
```

## Installation

### Python (Pyright)
```bash
npm install -g pyright
```

### TypeScript/JavaScript
```bash
npm install -g typescript typescript-language-server
```

### Rust
```bash
rustup component add rust-analyzer
```

### Go
```bash
go install golang.org/x/tools/gopls@latest
```

## Configuration

Claude Code has native LSP integration. To use:
1. Ensure the language server is installed
2. Open a project in that language
3. LSP automatically activates
4. Use natural language to perform LSP operations

## Performance Comparison

| Operation | Text Search (grep) | LSP |
|-----------|-------------------|-----|
| Find references | ~45 seconds | ~50ms |
| Speed factor | 1x | **900x faster** |
| Context awareness | None | Full semantic |
| False positives | Many | None |

## Best Practices

1. **Install language servers for your stack**: Set up LSP for all languages you use
2. **Trust LSP over text search**: When refactoring, always use LSP operations
3. **Leverage type information**: Use hover and diagnostics to understand code
4. **Safe renames only**: Never do find-replace for symbols; use LSP rename
5. **Navigate semantically**: Use "go to definition" instead of file searching

## Integration with MCP

Combine LSP with MCP servers for powerful workflows:
- **LSP**: Understand code structure internally
- **MCP**: Connect to external tools (GitHub, databases, etc.)
- **Together**: Build agents that understand your code AND deploy it

## Limitations

- Requires language server installation for each language
- Initial indexing may take time for very large codebases
- Language servers can crash (rare but possible)
- Not all languages have mature LSP implementations

## The Future: "Agents that Know"

LSP transforms AI from "Chatbots that Guess" to "Agents that Know":
- No more brute-force text searches
- Semantic understanding of code relationships
- Type-safe transformations
- Instant navigation and refactoring

**This is the new foundation for AI code assistance.**
