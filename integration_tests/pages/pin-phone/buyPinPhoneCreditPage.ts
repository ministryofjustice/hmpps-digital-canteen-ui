import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from '../abstractPage'

export default class BuyPinPhoneCreditPage extends AbstractPage {
  readonly header: Locator

  readonly creditTable: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.creditTable = page.locator('.govuk-table')
  }

  static async verifyOnPage(page: Page): Promise<BuyPinPhoneCreditPage> {
    const buyPinPhoneCreditPage = new BuyPinPhoneCreditPage(page)
    await expect(buyPinPhoneCreditPage.header).toContainText('Buy PIN phone credit')
    return buyPinPhoneCreditPage
  }

  async getTableRows() {
    return this.creditTable.locator('.govuk-table__row')
  }
}
