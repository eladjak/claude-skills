---
name: tailwind-patterns
description: "Tailwind CSS patterns and best practices"
---

# Tailwind Patterns

## Layout

### Flexbox
```tsx
// Center everything
<div className="flex items-center justify-center">

// Space between
<div className="flex items-center justify-between">

// Column layout
<div className="flex flex-col gap-4">

// Responsive
<div className="flex flex-col md:flex-row">
```

### Grid
```tsx
// Basic grid
<div className="grid grid-cols-3 gap-4">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Auto-fit
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
```

### Container
```tsx
<div className="container mx-auto px-4">
<div className="max-w-4xl mx-auto">
```

## Spacing

```tsx
// Padding
className="p-4"      // all sides
className="px-4"     // horizontal
className="py-2"     // vertical
className="pt-4"     // top only

// Margin
className="m-4"
className="mx-auto"  // center horizontally
className="mt-8"

// Gap (flex/grid)
className="gap-4"
className="gap-x-4 gap-y-2"
```

## Typography

```tsx
// Size
className="text-sm"   // 14px
className="text-base" // 16px
className="text-lg"   // 18px
className="text-xl"   // 20px
className="text-2xl"  // 24px

// Weight
className="font-normal"
className="font-medium"
className="font-semibold"
className="font-bold"

// Color
className="text-gray-900 dark:text-gray-100"
className="text-blue-600"
```

## Components

### Button
```tsx
<button className="
  px-4 py-2 rounded-lg
  bg-blue-600 text-white
  hover:bg-blue-700
  active:bg-blue-800
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors
">
```

### Card
```tsx
<div className="
  bg-white dark:bg-gray-800
  rounded-xl shadow-sm
  border border-gray-200 dark:border-gray-700
  p-6
">
```

### Input
```tsx
<input className="
  w-full px-4 py-2 rounded-lg
  border border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-800
  focus:ring-2 focus:ring-blue-500 focus:border-transparent
  outline-none transition-shadow
" />
```

## Dark Mode

```tsx
// Manual toggle
className="bg-white dark:bg-gray-900"
className="text-gray-900 dark:text-gray-100"

// System preference (in tailwind.config.js)
darkMode: 'media'

// Class-based (recommended)
darkMode: 'class'
```

## Responsive

```tsx
// Mobile first
className="text-sm md:text-base lg:text-lg"
className="hidden md:block"
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## Animations

```tsx
// Transitions
className="transition-all duration-200"
className="transition-colors"
className="transition-transform"

// Hover effects
className="hover:scale-105 transition-transform"
className="hover:-translate-y-1 transition-transform"
```
