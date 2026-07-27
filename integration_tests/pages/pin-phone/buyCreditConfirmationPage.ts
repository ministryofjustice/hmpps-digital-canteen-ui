import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from '../abstractPage'

export default class BuyCreditConfirmationPage extends AbstractPage {
  readonly panel: Locator

  readonly buyMoreCreditLink: Locator

  readonly viewContactsLink: Locator

  readonly launchpadHomeLink: Locator

  private constructor(page: Page) {
    super(page)
    this.panel = page.locator('.govuk-panel')
    this.buyMoreCreditLink = page.locator('a:has-text("buy more PIN phone credit")')
    this.viewContactsLink = page.locator('a:has-text("view your approved contacts")')
    this.launchpadHomeLink = page.locator('a:has-text("go to Launchpad Home")')
  }

  static async verifyOnPage(page: Page): Promise<BuyCreditConfirmationPage> {
    const buyCreditConfirmationPage = new BuyCreditConfirmationPage(page)
    await expect(buyCreditConfirmationPage.panel).toContainText('You have bought credit')
    return buyCreditConfirmationPage
  }
}
