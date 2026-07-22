import { test, expect } from '@playwright/test'
import { login } from '../../testUtils'
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

  test('can see the buy credit limit', async ({ page }) => {
    const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
    await expect(buyPage.insetText).toContainText('You can buy upto £10.00')
  })

  test('can see amount radio buttons', async ({ page }) => {
    const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
    const radios = buyPage.amountRadios

    await expect(radios).toHaveCount(6)
    await expect(radios.nth(0)).toContainText('£0.50')
    await expect(radios.nth(1)).toContainText('£1.00')
    await expect(radios.nth(2)).toContainText('£3.00')
    await expect(radios.nth(3)).toContainText('£5.00')
    await expect(radios.nth(4)).toContainText('Max (£10.00)')
    await expect(radios.nth(5)).toContainText('£ ')
  })

  test('can see divider', async ({ page }) => {
    const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
    expect(buyPage.divider.isVisible()).toBeTruthy()
  })

  test('can see custom amount input when other is selected', async ({ page }) => {
    const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
    await expect(buyPage.customAmountInput).toBeVisible()
  })

  test('Back Link', async ({ page }) => {
    const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
    await expect(buyPage.backLink).toContainText('Back')
    await expect(buyPage.backLink).toHaveAttribute('href', '/pin-phone')
  })

  test('can see continue button', async ({ page }) => {
    const buyPage = await BuyPinPhoneCreditPage.verifyOnPage(page)
    await expect(buyPage.continueButton).toContainText('Continue')
  })
})
