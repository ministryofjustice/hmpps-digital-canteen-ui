import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from '../abstractPage'

export default class ContactsPage extends AbstractPage {
  readonly header: Locator

  readonly insetText: Locator

  readonly backLink: Locator

  readonly table: Locator

  readonly tableRows: Locator

  readonly pagination: Locator

  readonly paginationItems: Locator

  readonly noContactsMessage: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.insetText = page.locator('.govuk-inset-text')
    this.backLink = page.locator('.govuk-back-link', { hasText: 'Back' })
    this.table = page.locator('.govuk-table')
    this.tableRows = page.locator('.govuk-table__body .govuk-table__row')
    this.pagination = page.locator('.moj-pagination')
    this.paginationItems = page.locator('.moj-pagination__item')
    this.noContactsMessage = page.locator('p.govuk-body.govuk-\\!-font-weight-bold')
  }

  static async verifyOnPage(page: Page): Promise<ContactsPage> {
    const contactsPage = new ContactsPage(page)
    await expect(contactsPage.header).toContainText('View PIN phone contacts')
    return contactsPage
  }
}
