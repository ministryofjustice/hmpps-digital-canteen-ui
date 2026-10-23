import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from '../abstractPage'

export default class CanteenLandingPage extends AbstractPage {
  readonly header: Locator

  readonly staffCard: Locator

  readonly breadcrumbHome: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.staffCard = page.locator('.app-card', { hasText: 'STAFF' })
    this.breadcrumbHome = page.locator('.govuk-breadcrumbs__link', { hasText: 'Home' })
  }

  static async verifyOnPage(page: Page): Promise<CanteenLandingPage> {
    const pinPhonePage = new CanteenLandingPage(page)
    await expect(pinPhonePage.header).toContainText('Canteen')
    return pinPhonePage
  }

  staffCardLink(): Locator {
    return this.staffCard.locator('a.app-card__link')
  }
}
