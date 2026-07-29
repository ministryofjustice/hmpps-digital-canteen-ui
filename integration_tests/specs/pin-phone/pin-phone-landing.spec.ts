import { test, expect } from '@playwright/test'
import { loginWithPrisonerAuth } from '../../testUtils'
import PinPhoneLandingPage from '../../pages/pin-phone/pinPhoneLandingPage'

test.describe('Pin Phone home page', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithPrisonerAuth(page)
    await page.goto('/pin-phone')
  })

  test('can see page heading with username', async ({ page }) => {
    await PinPhoneLandingPage.verifyOnPage(page)
    await expect(page.locator('h1')).toContainText("John's PIN phone")
  })

  test('can see buy credit card', async ({ page }) => {
    const pinPhonePage = await PinPhoneLandingPage.verifyOnPage(page)
    await expect(pinPhonePage.buyCreditsLink()).toHaveAttribute('href', '/pin-phone/buy-credit')
    await expect(pinPhonePage.buyCreditsCard).toContainText('Buy PIN phone credit')
  })

  test('can see view contacts card', async ({ page }) => {
    const pinPhonePage = await PinPhoneLandingPage.verifyOnPage(page)
    await expect(pinPhonePage.viewContactsLink()).toHaveAttribute('href', '/pin-phone/contacts')
    await expect(pinPhonePage.viewContactsCard).toContainText('View your approved and pending contacts')
  })

  test('link to home', async ({ page }) => {
    const pinPhonePage = await PinPhoneLandingPage.verifyOnPage(page)
    await expect(pinPhonePage.breadcrumbHome).toHaveAttribute('href', '/')
  })
})
