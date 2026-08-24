import { test, expect } from '@playwright/test'
import { loginWithPrisonerAuth } from '../../testUtils'
import BuyPinPhoneCreditPage from '../../pages/pin-phone/buyPinPhoneCreditPage'
import CheckOrderDetailsPage from '../../pages/pin-phone/checkOrderDetailsPage'
import digitalCanteenApi from '../../mockApis/digitalCanteenApi'

test.describe('Buy PIN phone credit page', () => {
  test.beforeEach(async ({ page }) => {
    await digitalCanteenApi.stubCreateCart()
    await digitalCanteenApi.stubGetBalances('A-BOOKING-ID')
    await loginWithPrisonerAuth(page)
    await page.goto('/pin-phone/buy-credit')
  })

  test.describe('balance summary', () => {
    test('should display current PIN phone credit', async ({ page }) => {
      const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
      const rows = await buyPage.getTableRows()
      await expect(rows.nth(0)).toContainText('Current PIN phone credit')
      await expect(rows.nth(0)).toContainText('£10.00')
    })

    test('should display spends balance', async ({ page }) => {
      const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
      const rows = await buyPage.getTableRows()
      await expect(rows.nth(1)).toContainText('Spends balance')
      await expect(rows.nth(1)).toContainText('£100.00')
    })

    test('should display PIN phone credit limit', async ({ page }) => {
      const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
      const rows = await buyPage.getTableRows()
      await expect(rows.nth(2)).toContainText('PIN phone credit limit')
      await expect(rows.nth(2)).toContainText('£50.00')
    })

    test('should show how much credit can be purchased', async ({ page }) => {
      const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
      await expect(buyPage.insetText).toContainText('You can buy up to £40.00')
    })
  })

  test.describe('amount selection', () => {
    test('should display predefined amount options', async ({ page }) => {
      const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
      // Radio buttons
      const radios = buyPage.amountRadios
      await expect(radios).toHaveCount(6)
      await expect(radios.nth(0)).toContainText('£0.50')
      await expect(radios.nth(1)).toContainText('£1.00')
      await expect(radios.nth(2)).toContainText('£3.00')
      await expect(radios.nth(3)).toContainText('£5.00')
      await expect(radios.nth(4)).toContainText('Max (£40.00)')
      await expect(radios.nth(5)).toContainText('£')
      // Other elements
      await expect(buyPage.divider.isVisible()).toBeTruthy()
    })

    test('should display custom amount input', async ({ page }) => {
      const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
      await expect(buyPage.customAmountInput).toBeVisible()
    })

    test('should proceed with a predefined amount', async ({ page }) => {
      const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
      await digitalCanteenApi.stubAddLineItem()
      await buyPage.amountRadios.nth(1).locator('input').click()
      await buyPage.continueButton.click()
      await CheckOrderDetailsPage.verifyOnPage(page)
    })

    test('should proceed with a custom amount', async ({ page }) => {
      const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
      await digitalCanteenApi.stubAddLineItem()
      await buyPage.amountRadios.last().locator('input[type="radio"]').click()
      await buyPage.customAmountInput.fill('7.50')
      await buyPage.continueButton.click()
      await CheckOrderDetailsPage.verifyOnPage(page)
    })
  })

  test('should display an error when no amount is selected', async ({ page }) => {
    const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
    await buyPage.continueButton.click()
    await expect(buyPage.errorSummary).toBeVisible()
  })

  test.describe('navigation', () => {
    test('should link back to PIN phone landing page', async ({ page }) => {
      const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
      await expect(buyPage.backLink).toHaveAttribute('href', '/pin-phone')
    })
  })
})
