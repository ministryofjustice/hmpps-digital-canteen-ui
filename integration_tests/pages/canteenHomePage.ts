import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class CanteenHomePage extends AbstractPage {
  readonly header: Locator

  readonly subNavigation: Locator

  readonly items: Locator

  readonly summaryCards: Locator

  readonly summaryLabels: Locator

  readonly summaryValues: Locator

  readonly searchButton: Locator

  readonly breadcrumbHome: Locator

  readonly orderSummary: Locator

  readonly searchInput: Locator

  readonly searchLabel: Locator

  readonly searchHint: Locator

  readonly categories: Locator

  readonly activeCategory: Locator

  readonly productsHeading: Locator

  readonly productCards: Locator

  readonly pagination: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.subNavigation = page.locator('.mojSubNavigation')
    this.items = page.locator('.moj-sub-navigation__item')
    this.orderSummary = page.locator('.order-summary')
    this.summaryCards = page.locator('.summary-card')
    this.summaryLabels = page.locator('.summary-card .summary-label')
    this.summaryValues = page.locator('.summary-card .summary-value')
    this.searchInput = page.locator('#search')
    this.searchButton = page.getByRole('button', { name: 'Search' })
    this.searchLabel = page.getByText('Search for products')
    this.searchHint = page.getByText('You can search by name or description')
    this.categories = page.locator('.moj-side-navigation__item')
    this.activeCategory = page.locator('.moj-side-navigation__item--active')
    this.productsHeading = page.locator('#products-heading')
    this.productCards = page.locator('[data-qa="product-card"]')
    this.pagination = page.getByRole('navigation', { name: 'Product results' })
    this.breadcrumbHome = page.locator('.govuk-breadcrumbs__link', { hasText: 'Home' })
  }

  static async verifyOnPage(page: Page): Promise<CanteenHomePage> {
    const canteenHomePage = new CanteenHomePage(page)
    await expect(canteenHomePage.header).toContainText('Canteen')
    return canteenHomePage
  }
}
