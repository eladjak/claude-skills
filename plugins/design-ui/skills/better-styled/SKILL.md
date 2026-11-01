---
name: better-styled
description: "Type-safe styled components for React and React Native with context propagation. Use when building cross-platform components, compound components, variant inheritance, or consistent styling across web and mobile."
---

# better-styled - Type-Safe Cross-Platform Styled Components

## What is better-styled?

A TypeScript library for building type-safe styled components that work identically in React (web) and React Native.

**Website:** https://better-styled.com

## Key Features

1. **Type-Safe by Default** - Full TypeScript inference without manual typing or `as const`
2. **Context Propagation** - Variants automatically flow from parent to child components
3. **Compound Components** - Slots pattern for complex component structures
4. **Universal API** - Same syntax for React web and React Native

## Installation

```bash
# Web
bun add better-styled

# React Native
bun add better-styled-native
```

## Core Patterns

### Basic Styled Component
```typescript
import { styled } from 'better-styled'

const Button = styled('button', {
  base: 'px-4 py-2 rounded font-medium',
  variants: {
    size: {
      sm: 'text-sm px-3 py-1',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    },
    variant: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-800',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
})
```

### Context Propagation (Key Feature)
```typescript
// Parent sets variant once, children inherit automatically
const Card = styled('div', {
  base: 'rounded-lg border',
  variants: {
    theme: {
      light: 'bg-white border-gray-200',
      dark: 'bg-gray-900 border-gray-700',
    },
  },
})

const CardTitle = styled('h3', {
  base: 'font-bold',
  variants: {
    theme: {
      light: 'text-gray-900',
      dark: 'text-white',
    },
  },
})

// Usage: CardTitle automatically inherits theme from Card
<Card theme="dark">
  <CardTitle>Title</CardTitle>  {/* Automatically dark theme */}
</Card>
```

### Compound Components (Slots Pattern)
```typescript
const Alert = styled.compound({
  root: styled('div', {
    base: 'p-4 rounded-lg border',
    variants: {
      severity: {
        info: 'bg-blue-50 border-blue-200',
        warning: 'bg-yellow-50 border-yellow-200',
        error: 'bg-red-50 border-red-200',
      },
    },
  }),
  icon: styled('span', {
    base: 'mr-2',
    variants: {
      severity: {
        info: 'text-blue-500',
        warning: 'text-yellow-500',
        error: 'text-red-500',
      },
    },
  }),
  message: styled('p', {
    base: 'text-sm',
  }),
})

// Usage
<Alert severity="error">
  <Alert.Icon>!</Alert.Icon>
  <Alert.Message>Something went wrong</Alert.Message>
</Alert>
```

## When to Use

| Scenario | Use better-styled? |
|----------|-------------------|
| Cross-platform React + RN app | YES - same API everywhere |
| Complex compound components | YES - context propagation |
| Existing Tailwind project | YES - works with Tailwind classes |
| Simple single-platform app | OPTIONAL - CVA/class-variance-authority also works |
| Non-React project | NO - React/RN only |

## vs. Other Solutions

| Library | Cross-Platform | Context Propagation | Type Safety |
|---------|---------------|-------------------|-------------|
| better-styled | React + RN | Automatic | Full inference |
| CVA | Web only | Manual | Good |
| styled-components | Web only | ThemeProvider | Partial |
| NativeWind | RN focused | No | Good |
| Tamagui | React + RN | Partial | Good |

## Integration with Our Stack

- Works alongside shadcn/ui components
- Compatible with Tailwind CSS classes
- Use with `composition-patterns` skill for compound component best practices
- Follows `ui-skills` constraints for accessible components
