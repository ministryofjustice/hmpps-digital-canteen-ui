import { test, expect } from '@playwright/test'
import { login } from '../../testUtils'
import OfficialContactsPage from '../../pages/pin-phone/OfficialContactsPage'

const expectedFirstSummaryKeys = ['Date added', 'Contact type', 'Status']

const expectedKeys = [
  'First name',
  'Last name',
  'Organisation',
  'Relationship',
  'Telephone number 1',
  'Telephone number 2',
]

test.describe('Pin Phone view official contacts page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test.describe('View official contacts', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/pin-phone/contacts/official-contact/:contactId')
    })
    // todo update once API implemented
    test.skip('can see contacts full name', async ({ page }) => {
      const officialContactsPage = await OfficialContactsPage.verifyOnPage(page)
      await expect(officialContactsPage.header).toContainText('contact name')
    })

    test('link to pin phone landing', async ({ page }) => {
      const officialContactsPage = await OfficialContactsPage.verifyOnPage(page)
      await expect(officialContactsPage.backLink).toHaveAttribute('href', '/pin-phone/contacts')
    })

    test('inset text with link', async ({ page }) => {
      const officialContactsPage = await OfficialContactsPage.verifyOnPage(page)
      await expect(officialContactsPage.insetText).toBeVisible()
      await expect(officialContactsPage.insetText.locator('a')).toHaveAttribute('href', /prisoner-apps/)
    })

    test('should render first social contact rows', async ({ page }) => {
      const keys = page.locator('.govuk-summary-list').first().locator('.govuk-summary-list__key')

      await expect(keys).toHaveText(expectedFirstSummaryKeys)
    })

    test('should render second official contact rows', async ({ page }) => {
      const keys = page.locator('.govuk-summary-list').last().locator('.govuk-summary-list__key')
      await expect(keys).toHaveText(expectedKeys)
    })

    test('Back button should display', async ({ page }) => {
      const officialContactsPage = await OfficialContactsPage.verifyOnPage(page)
      await expect(officialContactsPage.backButton).toHaveAttribute('href', '/pin-phone/contacts')
    })
  })
})
