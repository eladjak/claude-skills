---
name: interactive-faq-chat
description: "A standalone, self-contained FAQ-as-Chat component that presents frequently asked questions in a conversational chat interface. Dark them..."
---

# Interactive FAQ Chat Component

## Trigger Words
- "faq chat"
- "interactive faq"
- "chat faq"
- "conversational faq"
- "faq component"

## Overview
A standalone, self-contained FAQ-as-Chat component that presents frequently asked questions in a conversational chat interface. Dark theme, RTL Hebrew, mobile responsive, with typing animations and smooth scrolling.

## Usage
Drop the HTML file into any website as a section or embed it in an iframe. Fully self-contained with no external dependencies.

### Customization
Edit the `CONFIG` object at the top of the script:
```javascript
const CONFIG = {
  responderName: 'שם המשיב',         // Name shown in chat
  responderAvatar: 'א',          // Avatar initials
  statusText: 'מחובר עכשיו',     // Online status text
  typingDelay: 1500,              // Typing animation duration (ms)
  // ... FAQ items array
};
```

### Adding/Editing Questions
Add items to the `faqItems` array:
```javascript
{ q: 'השאלה שלך?', a: 'התשובה שלך.' }
```

## Features
- Dark theme matching ECC/portfolio style
- RTL Hebrew layout
- Configurable avatar + responder name
- "Online now" green status indicator
- Clickable question buttons at the bottom
- User message appears, then "typing..." animation (1.5s), then answer fades in
- Smooth auto-scroll to latest message
- Messages fade in with CSS animation
- Mobile responsive
- Zero dependencies — pure HTML/CSS/JS
- Can be dropped into any website as a section

## Demo File
`scripts/faq-chat-component.html` — open directly in browser for a live demo.

## Integration Examples

### As a section in Next.js
```tsx
export function FAQChat() {
  return (
    <section className="w-full py-12">
      <iframe
        src="/faq-chat.html"
        className="w-full max-w-2xl mx-auto h-[600px] border-0 rounded-xl"
        title="FAQ Chat"
      />
    </section>
  );
}
```

### As a standalone page
Simply serve `faq-chat-component.html` as a static file.

### Embedded in any HTML
```html
<div style="max-width: 640px; margin: 0 auto;">
  <iframe src="faq-chat-component.html" width="100%" height="600" frameborder="0"></iframe>
</div>
```
