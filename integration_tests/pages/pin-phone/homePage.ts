import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from '../abstractPage'

export default class HomePage extends AbstractPage {
  readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
  }

  static async verifyOnPage(page: Page): Promise<HomePage> {
    const launchpadPage = new HomePage(page)
    await expect(launchpadPage.header).toBeVisible()
    return launchpadPage
  }
}
