import { test, expect } from '@playwright/test'
import { login } from '../../testUtils'
import ContactsPage from '../../pages/pin-phone/ContactsPage'

test.describe('Pin Phone view contacts page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test.describe('with multiple pages of contacts', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/pin-phone/contacts')
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

    // test.skip('displays 10 contacts per page', async ({ page }) => {
    //   // todo update when API implemented
    // })
    //
    // test.skip('sorts contacts alphabetically', async ({ page }) => {
    //   // todo update when API implemented
    // })
    //
    // test.skip('displays table column headers', async ({ page }) => {
    //   // todo update when API implemented
    // })
    //
    // test.skip('contact name links to social contact', async ({ page }) => {
    //   // todo update when API implemented
    // })
    //
    // test.skip('contact name links to official contact', async ({ page }) => {
    //   // todo update when API implemented
    // })
    //
    // test.skip('displays pagination', async ({ page }) => {
    //   // todo update when API implemented
    // })
    //
    // test.skip('can navigate to second page', async ({ page }) => {
    //   // todo update when API implemented
    // })
  })

  // test.describe.skip('with single page of contacts', () => {
  //   // todo update when API implemented
  // })
  //
  // test.describe.skip('with no contacts', () => {
  //   // todo update when API implemented
  // })
})
