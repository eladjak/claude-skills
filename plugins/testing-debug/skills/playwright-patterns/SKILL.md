---
name: playwright-patterns
description: "Playwright E2E testing patterns"
---

# Playwright Patterns

## Setup

```bash
bun add -d @playwright/test
bunx playwright install
```

## Basic Test

```typescript
// tests/example.spec.ts
import { test, expect } from '@playwright/test'

test('homepage has title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/My App/)
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible()
})
```

## Locators

```typescript
// By role (preferred)
page.getByRole('button', { name: 'Submit' })
page.getByRole('link', { name: 'Home' })
page.getByRole('textbox', { name: 'Email' })

// By text
page.getByText('Welcome')
page.getByText(/welcome/i)

// By label
page.getByLabel('Email')

// By placeholder
page.getByPlaceholder('Enter email')

// By test ID
page.getByTestId('submit-button')

// CSS selector (last resort)
page.locator('.my-class')
page.locator('#my-id')
```

## Actions

```typescript
// Click
await page.getByRole('button').click()

// Fill input
await page.getByLabel('Email').fill('test@example.com')

// Select
await page.getByRole('combobox').selectOption('value')

// Check/uncheck
await page.getByRole('checkbox').check()

// Type with delay
await page.getByLabel('Search').type('hello', { delay: 100 })

// Press key
await page.keyboard.press('Enter')
```

## Assertions

```typescript
// Visibility
await expect(locator).toBeVisible()
await expect(locator).toBeHidden()

// Text content
await expect(locator).toHaveText('Hello')
await expect(locator).toContainText('Hello')

// Attribute
await expect(locator).toHaveAttribute('href', '/home')

// Input value
await expect(locator).toHaveValue('test@example.com')

// Count
await expect(locator).toHaveCount(3)

// URL
await expect(page).toHaveURL('/dashboard')
```

## Page Object Model

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email)
    await this.page.getByLabel('Password').fill(password)
    await this.page.getByRole('button', { name: 'Login' }).click()
  }
}

// tests/login.spec.ts
test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('test@example.com', 'password')
  await expect(page).toHaveURL('/dashboard')
})
```

## Fixtures

```typescript
// fixtures.ts
import { test as base } from '@playwright/test'

export const test = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Login' }).click()
    await use(page)
  }
})
```

## Config

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
})
```
