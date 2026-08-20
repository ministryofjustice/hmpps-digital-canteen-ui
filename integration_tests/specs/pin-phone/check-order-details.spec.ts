import { test, expect } from '@playwright/test'
import { loginWithPrisonerAuth } from '../../testUtils'
import CheckOrderDetailsPage from '../../pages/pin-phone/checkOrderDetailsPage'
import digitalCanteenApi from '../../mockApis/digitalCanteenApi'

test.describe('Check order details page', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithPrisonerAuth(page)
    await digitalCanteenApi.stubGetBalances('A-BOOKING-ID')
    await page.goto('/pin-phone/buy-credit')

    const otherRadio = page.locator('input[type="radio"]').last()
    await otherRadio.click()
    await page.locator('#customAmount').fill('7.50')
    await page.locator('button[type="submit"]').click()
  })

  test('can see page heading', async ({ page }) => {
    await CheckOrderDetailsPage.verifyOnPage(page)
  })

  test('can see order details in summary list', async ({ page }) => {
    const checkOrderDetailsPage = await CheckOrderDetailsPage.verifyOnPage(page)

    await expect(checkOrderDetailsPage.getSummaryValue('Current PIN phone credit')).toContainText('£10.00')
    await expect(checkOrderDetailsPage.getSummaryValue('How much you want to buy')).toContainText('£7.50')
    await expect(checkOrderDetailsPage.getSummaryValue('Credit after buying')).toContainText('£17.50')

    const changeLink = checkOrderDetailsPage.getSummaryAction('How much you want to buy')
    await expect(changeLink).toHaveAttribute('href', '/pin-phone/buy-credit')
    await expect(changeLink).toContainText('Change')
  })

  test('can see back link', async ({ page }) => {
    const checkOrderDetailsPage = await CheckOrderDetailsPage.verifyOnPage(page)
    await expect(checkOrderDetailsPage.backLink).toHaveAttribute('href', '/pin-phone/buy-credit')
  })

  test('can see buy credit button', async ({ page }) => {
    const checkOrderDetailsPage = await CheckOrderDetailsPage.verifyOnPage(page)
    await expect(checkOrderDetailsPage.buyCreditButton).toBeVisible()
  })

  test('can see cancel link', async ({ page }) => {
    const checkOrderDetailsPage = await CheckOrderDetailsPage.verifyOnPage(page)
    await expect(checkOrderDetailsPage.cancelLink).toHaveAttribute('href', '/pin-phone')
  })
})
