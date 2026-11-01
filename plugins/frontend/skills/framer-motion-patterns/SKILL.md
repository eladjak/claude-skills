---
name: framer-motion-patterns
description: "Framer Motion animation patterns"
---

# Framer Motion Patterns

## Basic Animations

```tsx
import { motion } from 'framer-motion'

// Simple animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Hover and tap
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

## Variants

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.ul
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.text}
    </motion.li>
  ))}
</motion.ul>
```

## AnimatePresence

```tsx
import { AnimatePresence } from 'framer-motion'

<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      Modal content
    </motion.div>
  )}
</AnimatePresence>
```

## Layout Animations

```tsx
// Auto-animate layout changes
<motion.div layout>
  {expanded && <ExpandedContent />}
</motion.div>

// Shared layout
<motion.div layoutId="shared-element">
  {isSelected ? <LargeView /> : <SmallView />}
</motion.div>
```

## Scroll Animations

```tsx
import { useScroll, useTransform, motion } from 'framer-motion'

function ParallaxImage() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])

  return <motion.img style={{ y }} src="..." />
}

// Scroll-triggered
import { useInView } from 'framer-motion'

function FadeInSection({ children }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
    >
      {children}
    </motion.div>
  )
}
```

## Gestures

```tsx
// Drag
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
  dragElastic={0.1}
>
  Drag me
</motion.div>

// Pan
<motion.div
  onPan={(e, info) => console.log(info.offset)}
  onPanEnd={(e, info) => console.log('ended')}
>
  Pan me
</motion.div>
```

## Spring Physics

```tsx
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 20
  }}
/>

// Presets
transition={{ type: 'spring', bounce: 0.5 }}
transition={{ type: 'tween', ease: 'easeInOut' }}
```

## Keyframes

```tsx
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    rotate: [0, 180, 360]
  }}
  transition={{ duration: 2, repeat: Infinity }}
/>
```

## Performance Tips

```tsx
// Use transform properties only
animate={{ x, y, scale, rotate, opacity }}

// Avoid animating layout properties
// ❌ width, height, top, left, margin, padding

// Use layoutId for shared element transitions
// Use will-change sparingly
```
