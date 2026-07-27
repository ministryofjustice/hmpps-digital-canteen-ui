import { test, expect } from '@playwright/test'
import { login } from '../../testUtils'
import BuyCreditConfirmationPage from '../../pages/pin-phone/buyCreditConfirmationPage'

test.describe('Buy credit confirmation page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/pin-phone/buy-credit-confirmation')
  })

  test('can see confirmation page', async ({ page }) => {
    const dateBought = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const confirmationPage = await BuyCreditConfirmationPage.verifyOnPage(page)
    await expect(confirmationPage.panel).toContainText('You have bought credit')
    await expect(confirmationPage.panel).toContainText('Date bought')
    await expect(confirmationPage.panel).toContainText(dateBought)

    // can see a success message
    await expect(page.getByText('Your credit has been added to your PIN phone account.')).toBeVisible()

    // can see actionable links
    await expect(confirmationPage.buyMoreCreditLink).toBeVisible()
    await expect(confirmationPage.buyMoreCreditLink).toHaveAttribute('href', '/pin-phone/buy-credit')

    await expect(confirmationPage.viewContactsLink).toBeVisible()
    await expect(confirmationPage.viewContactsLink).toHaveAttribute('href', '/pin-phone/view-contacts')

    await expect(confirmationPage.launchpadHomeLink).toBeVisible()
    await expect(confirmationPage.launchpadHomeLink).toHaveAttribute('href', '/launchpad')
  })
})
