import { test, expect } from '@playwright/test'
import { login } from '../../testUtils'
import CheckOrderDetailsPage from '../../pages/pin-phone/checkOrderDetailsPage'

test.describe('Check order details page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/pin-phone/check-order-details')
  })

  test('can see page heading', async ({ page }) => {
    await CheckOrderDetailsPage.verifyOnPage(page)
  })

  test('can see order details in summary list', async ({ page }) => {
    const checkOrderDetailsPage = await CheckOrderDetailsPage.verifyOnPage(page)

    await expect(checkOrderDetailsPage.getSummaryValue('Current PIN phone credit')).toContainText('£35.13')
    await expect(checkOrderDetailsPage.getSummaryValue('How much you want to buy')).toContainText('£0')
    await expect(checkOrderDetailsPage.getSummaryValue('Credit after buying')).toContainText('£35.13')

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
