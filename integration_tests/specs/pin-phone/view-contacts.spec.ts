import { test, expect } from '@playwright/test'
import { loginWithPrisonerAuth } from '../../testUtils'
import ContactsPage from '../../pages/pin-phone/ContactsPage'
import digitalCanteenApi from '../../mockApis/digitalCanteenApi'

test.describe('Pin Phone view contacts page', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithPrisonerAuth(page)
  })

  test.describe('with multiple pages of contacts', () => {
    test.beforeEach(async ({ page }) => {
      await digitalCanteenApi.stubGetMoreThan10Contacts('A-BOOKING-ID')
      await page.goto('/pin-phone/view-contacts')
    })

    test('can see page heading', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await expect(contactsPage.header).toContainText('View PIN phone contacts')
    })

    test('link to pin phone landing', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await expect(contactsPage.backLink).toHaveAttribute('href', '/pin-phone')
    })

    test('inset text with link', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await expect(contactsPage.insetText).toBeVisible()
      await expect(contactsPage.insetText.locator('a')).toHaveAttribute('href', /prisoner-apps/)
    })

    test('displays 10 contacts per page', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      const rows = contactsPage.tableRows
      await expect(rows).toHaveCount(10)
    })

    test('sorts contacts alphabetically', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      const names = await contactsPage.tableRows.locator('td:first-child').allTextContents()
      const sorted = [...names].sort((a, b) => a.localeCompare(b))
      expect(names).toEqual(sorted)
    })

    test('contact name links to social contact', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      const firstLink = contactsPage.tableRows.first().locator('a')
      await expect(firstLink).toHaveAttribute('href', /social-contact/)
    })

    test('contact name links to professional contact', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      const professionalLink = contactsPage.tableRows.locator('a[href*="professional-contact"]').first()
      await expect(professionalLink).toBeVisible()
    })

    test('displays pagination', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await expect(contactsPage.pagination).toBeVisible()
    })

    test('can navigate to second page contacts', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await contactsPage.pagination.locator('a:has-text("2")').click()
      await expect(page).toHaveURL(/page=1/)
    })
  })

  test.describe('with single page of contacts', () => {
    test.beforeEach(async ({ page }) => {
      await digitalCanteenApi.stubGetLessThan10Contacts('A-BOOKING-ID')
      await page.goto('/pin-phone/view-contacts')
    })

    test('can see page heading', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await expect(contactsPage.header).toContainText('View PIN phone contacts')
    })

    test('link to pin phone landing', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await expect(contactsPage.backLink).toHaveAttribute('href', '/pin-phone')
    })

    test('inset text with link', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await expect(contactsPage.insetText).toBeVisible()
      await expect(contactsPage.insetText.locator('a')).toHaveAttribute('href', /prisoner-apps/)
    })

    test('displays 10 contacts per page', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      const rows = contactsPage.tableRows
      await expect(rows).toHaveCount(5)
    })

    test('does not display pagination links', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await expect(contactsPage.pagination).toBeVisible()
      await expect(contactsPage.pagination.locator('a:has-text("2")')).not.toBeVisible()
    })
  })

  test.describe('with no contacts', () => {
    test.beforeEach(async ({ page }) => {
      await digitalCanteenApi.stubGetNoContacts('A-BOOKING-ID')
      await page.goto('/pin-phone/view-contacts')
    })

    test('can see page heading', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await expect(contactsPage.header).toContainText('View PIN phone contacts')
    })

    test('link to pin phone landing', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await expect(contactsPage.backLink).toHaveAttribute('href', '/pin-phone')
    })

    test('inset text with link', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      await expect(contactsPage.insetText).toBeVisible()
      await expect(contactsPage.insetText.locator('a')).toHaveAttribute('href', /prisoner-apps/)
    })

    test('displays no contact message', async ({ page }) => {
      const contactsPage = await ContactsPage.verifyOnPage(page)
      const noContacts = contactsPage.noContactsMessage
      await expect(noContacts).toBeVisible()
    })
  })
})
