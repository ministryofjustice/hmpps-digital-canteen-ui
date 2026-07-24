import { test, expect } from '@playwright/test'
import { login } from '../../testUtils'
import SocialContactsPage from '../../pages/pin-phone/SocialContactsPage'

const expectedFirstSummaryKeys = ['Date added', 'Contact type', 'Status']

const expectedSecondSummaryKeys = [
  'First name',
  'Last name',
  'Date of birth or age',
  'Relationship',
  'Address line 1',
  'Address line 2',
  'Town or city',
  'Postcode',
  'Country',
  'Telephone number 1',
  'Telephone number 2',
]

test.describe('Pin Phone view contacts page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test.describe('View social contacts', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/pin-phone/contacts/social-contact/:contactId')
    })
    // todo update once API implemented
    test.skip('can see contacts full name', async ({ page }) => {
      const socialContactsPage = await SocialContactsPage.verifyOnPage(page)
      await expect(socialContactsPage.header).toContainText('contact name')
    })

    test('link to pin phone landing', async ({ page }) => {
      const socialContactsPage = await SocialContactsPage.verifyOnPage(page)
      await expect(socialContactsPage.backLink).toHaveAttribute('href', '/pin-phone/contacts')
    })

    test('inset text with link', async ({ page }) => {
      const socialContactsPage = await SocialContactsPage.verifyOnPage(page)
      await expect(socialContactsPage.insetText).toBeVisible()
      await expect(socialContactsPage.insetText.locator('a')).toHaveAttribute('href', /prisoner-apps/)
    })

    test('should render first social contact rows', async ({ page }) => {
      const keys = page.locator('.govuk-summary-list').first().locator('.govuk-summary-list__key')

      await expect(keys).toHaveText(expectedFirstSummaryKeys)
    })

    test('should render second social contact rows', async ({ page }) => {
      const keys = page.locator('.govuk-summary-list').last().locator('.govuk-summary-list__key')
      await expect(keys).toHaveText(expectedSecondSummaryKeys)
    })

    test('Back button should display', async ({ page }) => {
      const socialContactsPage = await SocialContactsPage.verifyOnPage(page)
      await expect(socialContactsPage.backButton).toHaveAttribute('href', '/pin-phone/contacts')
    })
  })
})
