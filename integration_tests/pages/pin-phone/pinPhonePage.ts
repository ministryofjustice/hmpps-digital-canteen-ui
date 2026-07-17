import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from '../abstractPage'

export default class PinPhonePage extends AbstractPage {
  readonly header: Locator

  readonly buyCreditsCard: Locator

  readonly viewContactsCard: Locator

  readonly breadcrumbHome: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.buyCreditsCard = page.locator('.app-card', { hasText: 'Buy credit' })
    this.viewContactsCard = page.locator('.app-card', { hasText: 'View contacts' })
    this.breadcrumbHome = page.locator('.govuk-breadcrumbs__link', { hasText: 'Home' })
  }

  static async verifyOnPage(page: Page): Promise<PinPhonePage> {
    const pinPhonePage = new PinPhonePage(page)
    await expect(pinPhonePage.header).toContainText('PIN phone')
    return pinPhonePage
  }

  buyCreditsLink(): Locator {
    return this.buyCreditsCard.locator('a.app-card__link')
  }

  viewContactsLink(): Locator {
    return this.viewContactsCard.locator('a.app-card__link')
  }
}
