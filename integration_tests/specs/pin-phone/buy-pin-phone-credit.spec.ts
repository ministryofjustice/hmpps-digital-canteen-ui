import { test, expect } from '@playwright/test'
import { login } from '../../testUtils'
import BuyPinPhoneCreditPage from '../../pages/pin-phone/buyPinPhoneCreditPage'
import CheckOrderDetailsPage from '../../pages/pin-phone/checkOrderDetailsPage'

test.describe('Buy PIN phone credit page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/pin-phone/buy-credit')
  })

  test('should display all page elements correctly', async ({ page }) => {
    const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)

    // Table details
    const rows = await buyPage.getTableRows()
    await expect(rows.nth(0)).toContainText('Current PIN phone credit')
    await expect(rows.nth(0)).toContainText('£35.13')
    await expect(rows.nth(1)).toContainText('Spends balance')
    await expect(rows.nth(1)).toContainText('£47.00')
    await expect(rows.nth(2)).toContainText('PIN phone credit limit')
    await expect(rows.nth(2)).toContainText('£50.00')

    // Inset text
    await expect(buyPage.insetText).toContainText('You can buy up to £10.00')

    // Radio buttons
    const radios = buyPage.amountRadios
    await expect(radios).toHaveCount(6)
    await expect(radios.nth(0)).toContainText('£0.50')
    await expect(radios.nth(1)).toContainText('£1.00')
    await expect(radios.nth(2)).toContainText('£3.00')
    await expect(radios.nth(3)).toContainText('£5.00')
    await expect(radios.nth(4)).toContainText('Max (£10.00)')
    await expect(radios.nth(5)).toContainText('£')

    // Other elements
    await expect(buyPage.divider.isVisible()).toBeTruthy()
    await expect(buyPage.customAmountInput).toBeVisible()
    await expect(buyPage.backLink).toHaveAttribute('href', '/pin-phone')
    await expect(buyPage.continueButton).toBeVisible()
  })

  test('should allow selecting a predefined amount and continuing', async ({ page }) => {
    const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)

    await buyPage.amountRadios.nth(1).click() // £1.00
    await buyPage.continueButton.click()

    await CheckOrderDetailsPage.verifyOnPage(page)
  })

  test('should allow entering a custom amount and continuing', async ({ page }) => {
    const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)

    await buyPage.amountRadios.last().click()
    await buyPage.customAmountInput.fill('7.50')
    await buyPage.continueButton.click()

    await CheckOrderDetailsPage.verifyOnPage(page)
  })
})
