import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the hero heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Track less')
    await expect(page.locator('h1')).toContainText('Live more')
  })

  test('should display navigation links', async ({ page }) => {
    await expect(page.getByText('Features')).toBeVisible()
    await expect(page.getByText('How it works')).toBeVisible()
    await expect(page.getByText('AI Insights')).toBeVisible()
  })

  test('should open auth modal on "Get Started" click', async ({ page }) => {
    await page.getByRole('button', { name: 'Get Started' }).click()
    await expect(page.getByText('Start your trail')).toBeVisible()
    await expect(page.getByText('Sign up')).toBeVisible()
  })

  test('should open auth modal in login mode on "Log in" click', async ({ page }) => {
    await page.getByRole('button', { name: 'Log in' }).first().click()
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('should close auth modal on backdrop click', async ({ page }) => {
    await page.getByRole('button', { name: 'Get Started' }).click()
    await expect(page.getByText('Start your trail')).toBeVisible()

    // Click backdrop (outside modal)
    await page.mouse.click(10, 10)
    await expect(page.getByText('Start your trail')).toBeHidden()
  })

  test('should switch between login and signup tabs', async ({ page }) => {
    await page.getByRole('button', { name: 'Get Started' }).click()

    // Should start in signup mode
    await expect(page.getByPlaceholder('Your name')).toBeVisible()

    // Switch to login
    await page.getByRole('button', { name: 'Log in' }).nth(1).click()
    await expect(page.getByText('Welcome back')).toBeVisible()

    // Switch back to signup
    await page.getByRole('button', { name: 'Sign up' }).nth(1).click()
    await expect(page.getByPlaceholder('Your name')).toBeVisible()
  })
})
