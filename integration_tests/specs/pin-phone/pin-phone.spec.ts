import { test, expect } from '@playwright/test'
import { login } from '../../testUtils'
import PinPhonePage from '../../pages/pin-phone/pinPhonePage'

test.describe('Pin Phone home page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/pin-phone')
  })

  test('can see page heading with username', async ({ page }) => {
    await PinPhonePage.verifyOnPage(page)
    await expect(page.locator('h1')).toContainText("John's PIN phone")
  })

  test('can see buy credit card', async ({ page }) => {
    const pinPhonePage = await PinPhonePage.verifyOnPage(page)
    await expect(pinPhonePage.buyCreditsLink()).toHaveAttribute('href', '/pin-phone/buy-credit')
    await expect(pinPhonePage.buyCreditsCard).toContainText('Buy PIN phone credit')
  })

  test('can see view contacts card', async ({ page }) => {
    const pinPhonePage = await PinPhonePage.verifyOnPage(page)
    await expect(pinPhonePage.viewContactsLink()).toHaveAttribute('href', '/pin-phone/contacts')
    await expect(pinPhonePage.viewContactsCard).toContainText('View your approved and pending contacts')
  })

  test('link to home', async ({ page }) => {
    const pinPhonePage = await PinPhonePage.verifyOnPage(page)
    await expect(pinPhonePage.breadcrumbHome).toHaveAttribute('href', '/')
  })
})
