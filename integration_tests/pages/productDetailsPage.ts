import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ProductDetailsPage extends AbstractPage {
  readonly header: Locator

  readonly breadcrumbs: Locator

  readonly summaryCard: Locator

  readonly backToProductButton: Locator

  readonly productRow: Locator

  readonly productName: Locator

  readonly productPrice: Locator

  readonly productDescription: Locator

  readonly productImage: Locator

  readonly quantitySelector: Locator

  readonly ingredientsSection: Locator

  readonly allergensSection: Locator

  readonly nutritionSection: Locator

  readonly addToBasketButton: Locator

  readonly decreaseQuantityButton: Locator

  readonly increaseQuantityButton: Locator

  readonly basketImage: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.breadcrumbs = page.locator('.govuk-breadcrumbs__link', { hasText: 'Home' })
    this.summaryCard = page.locator('.summary-card')
    this.backToProductButton = page.getByText('Back to all products')
    this.productRow = page.locator('.product-row')
    this.productImage = this.productRow.locator('img')
    this.productName = this.productRow.locator('h2')
    this.productDescription = this.productRow.locator('.govuk-body')
    this.productPrice = this.productRow.locator('.govuk-heading-l').last()
    this.quantitySelector = this.productRow.locator('.add-to-basket-container')
    this.ingredientsSection = page.getByText('Ingredients')
    this.allergensSection = page.getByText('Allergens')
    this.nutritionSection = page.getByText('Quick nutrition guide')
    this.addToBasketButton = page.getByRole('button', {
      name: 'Add to basket',
    })
    this.decreaseQuantityButton = page.getByRole('button', { name: '-' })
    this.increaseQuantityButton = page.getByRole('button', { name: '+' })
    this.basketImage = this.summaryCard.locator('.icon-basket')
  }

  static async verifyOnPage(page: Page): Promise<ProductDetailsPage> {
    const productPage = new ProductDetailsPage(page)
    await expect(productPage.header).toBeVisible()
    return productPage
  }
}
