import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from '../abstractPage'

export default class SocialContactsPage extends AbstractPage {
  readonly header: Locator

  readonly insetText: Locator

  readonly backLink: Locator

  readonly summaryRow: Locator

  readonly backButton: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.insetText = page.locator('.govuk-inset-text')
    this.backLink = page.locator('.govuk-back-link', { hasText: 'Back' })
    this.summaryRow = page.locator('.govuk-summary-list__row')
    this.backButton = page.locator('.govuk-button--secondary', { hasText: 'Back to view contacts' })
  }

  static async verifyOnPage(page: Page): Promise<SocialContactsPage> {
    const socialContactsPage = new SocialContactsPage(page)
    // todo update once API implemented
    await expect(socialContactsPage.header).toContainText('John Doe')
    return socialContactsPage
  }
}
