import { test, expect } from '@playwright/test'
import { login } from '../../testUtils'
import PinPhoneLandingPage from '../../pages/pin-phone/pinPhoneLandingPage'
import BuyPinPhoneCreditPage from '../../pages/pin-phone/buyPinPhoneCreditPage'

test.describe('Buy PIN phone credit page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/pin-phone/buy-credit')
  })

  test('can see page heading', async ({ page }) => {
    await BuyPinPhoneCreditPage.verifyOnPage(page)
  })

  test('can see credit details in table', async ({ page }) => {
    const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
    const table = buyPage.creditTable

    await expect(table.locator('tr').nth(0)).toContainText('Current PIN phone credit')
    await expect(table.locator('tr').nth(0)).toContainText('£35.13')

    await expect(table.locator('tr').nth(1)).toContainText('Spends balance')
    await expect(table.locator('tr').nth(1)).toContainText('£47.00')

    await expect(table.locator('tr').nth(2)).toContainText('PIN phone credit limit')
    await expect(table.locator('tr').nth(2)).toContainText('£50.00')
  })
})
