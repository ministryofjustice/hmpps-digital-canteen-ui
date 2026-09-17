import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from '../abstractPage'

export default class CheckOrderDetailsPage extends AbstractPage {
  readonly header: Locator

  readonly backLink: Locator

  readonly summaryList: Locator

  readonly buyCreditButton: Locator

  readonly cancelLink: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.backLink = page.locator('.govuk-back-link')
    this.summaryList = page.locator('.govuk-summary-list')
    this.buyCreditButton = page.locator('button', { hasText: 'Buy credit' })
    this.cancelLink = page.locator('.govuk-button-group a', { hasText: 'Cancel' })
  }

  static async verifyOnPage(page: Page): Promise<CheckOrderDetailsPage> {
    const checkOrderDetailsPage = new CheckOrderDetailsPage(page)
    await expect(checkOrderDetailsPage.header).toContainText('Check order details')
    return checkOrderDetailsPage
  }

  getSummaryRow(key: string): Locator {
    return this.summaryList.locator('.govuk-summary-list__row', { hasText: key })
  }

  getSummaryValue(key: string): Locator {
    return this.getSummaryRow(key).locator('.govuk-summary-list__value')
  }

  getSummaryAction(key: string): Locator {
    return this.getSummaryRow(key).locator('.govuk-summary-list__actions a')
  }
}
