---
name: resend-email
description: "Resend is a modern email API and CLI for sending transactional and broadcast emails. Features 53 CLI commands, JSON output mode, natural..."
---

# Resend Email Skill

## Trigger Words
- "send email"
- "resend"
- "email template"
- "broadcast"
- "email campaign"
- "transactional email"

## Overview
Resend is a modern email API and CLI for sending transactional and broadcast emails. Features 53 CLI commands, JSON output mode, natural language scheduling, and a built-in email editor for broadcasts.

## Installation

```bash
# CLI (global)
bun add -g resend

# SDK (project dependency)
bun add resend
```

## CLI Usage (53 commands)

### Authentication
```bash
resend login              # Interactive login
resend login --token re_xxx  # Token-based login
```

### Sending Emails
```bash
# Basic send
resend emails send --from "onboarding@resend.dev" --to "user@example.com" --subject "Hello" --text "World"

# HTML email
resend emails send --from "you@yourdomain.com" --to "user@example.com" --subject "Welcome" --html "<h1>Welcome!</h1>"

# With attachments
resend emails send --from "you@yourdomain.com" --to "user@example.com" --subject "Report" --text "See attached" --attach ./report.pdf

# JSON output mode (for scripting/piping)
resend emails send --from "you@yourdomain.com" --to "user@example.com" --subject "Test" --text "Body" --json
```

### Natural Language Scheduling
```bash
# Schedule for later (natural language!)
resend emails send --from "you@yourdomain.com" --to "user@example.com" --subject "Reminder" --text "Don't forget!" --schedule "tomorrow at 9am"
resend emails send --from "you@yourdomain.com" --to "user@example.com" --subject "Follow up" --text "Checking in" --schedule "in 2 hours"
```

### Domain Management
```bash
resend domains list                    # List all domains
resend domains create example.com     # Add a domain
resend domains verify example.com     # Verify DNS records
resend domains delete <domain-id>     # Remove a domain
```

### API Keys
```bash
resend api-keys list                  # List API keys
resend api-keys create --name "prod"  # Create new key
resend api-keys delete <key-id>       # Delete a key
```

### Contacts & Audiences
```bash
resend audiences list                           # List audiences
resend audiences create --name "Newsletter"     # Create audience
resend contacts list --audience-id <id>          # List contacts
resend contacts create --audience-id <id> --email "user@example.com" --first-name "John"
```

### Broadcasts (Email Editor)
```bash
resend broadcasts list                # List broadcasts
resend broadcasts create --name "March Newsletter" --audience-id <id> --from "news@yourdomain.com"
# Then use the Resend dashboard's built-in email editor for rich content
```

## SDK Usage (TypeScript/Node.js)

### Basic Setup
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
```

### Send Email
```typescript
const { data, error } = await resend.emails.send({
  from: 'the user <you@yourdomain.com>',
  to: ['user@example.com'],
  subject: 'Hello from Resend',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
});

if (error) {
  console.error('Failed to send:', error);
  return;
}
console.log('Email sent:', data?.id);
```

### Send with React Email Templates
```typescript
import { WelcomeEmail } from '@/emails/welcome';

const { data, error } = await resend.emails.send({
  from: 'the user <you@yourdomain.com>',
  to: ['user@example.com'],
  subject: 'Welcome!',
  react: WelcomeEmail({ firstName: 'John' }),
});
```

### Batch Send
```typescript
const { data, error } = await resend.batch.send([
  {
    from: 'you@yourdomain.com',
    to: 'user1@example.com',
    subject: 'Hello User 1',
    html: '<p>Hi!</p>',
  },
  {
    from: 'you@yourdomain.com',
    to: 'user2@example.com',
    subject: 'Hello User 2',
    html: '<p>Hi!</p>',
  },
]);
```

### Scheduled Email
```typescript
const { data, error } = await resend.emails.send({
  from: 'you@yourdomain.com',
  to: ['user@example.com'],
  subject: 'Scheduled Email',
  html: '<p>This was scheduled!</p>',
  scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
});
```

### Manage Contacts
```typescript
// Create contact
await resend.contacts.create({
  audienceId: 'aud_xxx',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  unsubscribed: false,
});

// List contacts
const { data } = await resend.contacts.list({ audienceId: 'aud_xxx' });
```

## Key Features (2026)
- **53 CLI commands** for full email management from terminal
- **JSON output mode** (`--json`) for scripting and piping
- **Natural language scheduling** ("tomorrow at 9am", "in 2 hours")
- **Built-in email editor** for broadcast campaigns (web dashboard)
- **React Email integration** for component-based email templates
- **Batch sending** for bulk operations
- **Webhooks** for delivery tracking (delivered, bounced, complained)
- **Domain verification** with DNS record management

## Environment Variables
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

## Pricing
- **Free tier**: 100 emails/day, 1 domain
- **Pro**: $20/mo, 50K emails/mo, unlimited domains
- **Enterprise**: Custom

## Error Handling (better-result pattern)
```typescript
import { Result } from 'better-result';
import { Resend } from 'resend';

const sendEmail = async (to: string, subject: string, html: string): Promise<Result<string, Error>> => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'you@yourdomain.com',
      to: [to],
      subject,
      html,
    });
    if (error) return Result.err(new Error(error.message));
    return Result.ok(data!.id);
  } catch (e) {
    return Result.err(e instanceof Error ? e : new Error(String(e)));
  }
};
```

## Links
- Docs: https://resend.com/docs
- Dashboard: https://resend.com
- React Email: https://react.email
- GitHub: https://github.com/resend/resend-node
