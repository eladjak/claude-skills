---
name: whatsapp-business-api
description: "WhatsApp Business API reference covering pricing, Green API vs Official Cloud API comparison, and template message best practices. Use when building WhatsApp integrations, choosing between API providers, estimating messaging costs, or configuring WhatsApp automation."
---

# WhatsApp Business API Reference

## When to Use
Use when building WhatsApp integrations, choosing between API providers, or estimating messaging costs.

## Pricing (2026)

### Template Messages (Business-initiated)
| Region | Cost per message |
|--------|-----------------|
| North America | $0.005 - $0.009 |
| Europe | $0.005 - $0.008 |
| Rest of World | $0.003 - $0.006 |

### Session Messages (User-initiated)
- **Free** for 24 hours after user sends a message
- Each user message opens a new 24-hour window
- No limit on messages within the window

### Free Tier
- 1,000 free service conversations per month
- Template message free tier varies by provider

## Green API vs Official Cloud API

| Feature | Green API | Official Cloud API |
|---------|-----------|-------------------|
| Setup | Minutes (instance ID + token) | Days (Meta Business verification) |
| Cost | ~$15-50/month subscription | Pay per message only |
| Phone Number | Uses existing personal/business number | Dedicated number required |
| Compliance | Unofficial (can be blocked) | Official Meta partnership |
| Webhooks | Built-in | Requires server setup |
| Rate Limits | ~60/min (varies) | Higher (official) |
| Best For | Prototyping, personal projects | Production, business use |

## Template Message Best Practices
- Keep templates short (< 160 chars for best delivery)
- Include clear call-to-action
- Personalize with {{variables}}
- Pre-approve templates before sending (24-48hr review)
- Avoid promotional language in utility templates
- Use rich media templates for higher engagement

## Key Decisions
- **Prototyping?** → Green API (fast setup, low cost)
- **Production business?** → Official Cloud API (compliance, reliability)
- **High volume?** → Official API with template optimization
- **Personal automation?** → Green API is sufficient
