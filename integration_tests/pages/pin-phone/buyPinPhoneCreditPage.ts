import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from '../abstractPage'

export default class BuyPinPhoneCreditPage extends AbstractPage {
  readonly header: Locator

  readonly creditTable: Locator

  readonly insetText: Locator

  readonly amountRadios: Locator

  readonly customAmountInput: Locator

  readonly continueButton: Locator

  readonly backLink: Locator

  readonly divider: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.creditTable = page.locator('.govuk-table')
    this.insetText = page.locator('.govuk-inset-text')
    this.amountRadios = page.locator('.pin-credit-radios .govuk-radios__item')
    this.customAmountInput = page.locator('#customAmount')
    this.continueButton = page.locator('button:has-text("Continue")')
    this.backLink = page.locator('.govuk-back-link')
    this.divider = page.locator('.govuk-divider')
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
