import { expect, test } from '@playwright/test'
import { loginWithPrisonerAuth } from '../testUtils'
import ProductDetailsPage from '../pages/productDetailsPage'
import config from '../../server/config'
import { PATHS } from '../../server/constants/paths'

test.describe('Canteen Product details page', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithPrisonerAuth(page)
    await page.goto('/canteen/product/:id')
  })

  test('can see page heading with username', async ({ page }) => {
    await expect(page.locator('h1')).toContainText("A TestUser's Canteen")
  })
  test('can see correct breadcrumbs', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Home' })).toHaveAttribute('href', config.launchpadHome)

    await expect(page.getByRole('link', { name: 'Canteen' })).toHaveAttribute('href', '/')

    await expect(page.locator('.govuk-breadcrumbs__list-item').last()).toContainText('Eco Orange Squash 1L (V)')
  })

  test('can see basket summary card', async ({ page }) => {
    const productDetailsPage = await ProductDetailsPage.verifyOnPage(page)
    await expect(productDetailsPage.basketImage).toBeVisible()
    await expect(productDetailsPage.summaryCard).toContainText('Basket total')
    await expect(productDetailsPage.summaryCard).toContainText('£')
  })

  test('can see back to all products link', async ({ page }) => {
    const productDetailsPage = await ProductDetailsPage.verifyOnPage(page)
    await expect(productDetailsPage.backToProductButton).toBeVisible()
  })

  test('returns to products page', async ({ page }) => {
    const productDetailsPage = await ProductDetailsPage.verifyOnPage(page)
    await productDetailsPage.backToProductButton.click()
    await expect(page).toHaveURL(PATHS.LANDING_PAGE)
  })

  test('displays product information', async ({ page }) => {
    const productDetailsPage = await ProductDetailsPage.verifyOnPage(page)
    await expect(productDetailsPage.productImage).toBeVisible()
    await expect(productDetailsPage.productName).toBeVisible()
    await expect(productDetailsPage.productDescription).toBeVisible()
    await expect(productDetailsPage.productPrice).toBeVisible()
    await expect(productDetailsPage.addToBasketButton).toBeVisible()
    await expect(productDetailsPage.ingredientsSection).toBeVisible()
    await expect(productDetailsPage.allergensSection).toBeVisible()
    await expect(productDetailsPage.nutritionSection).toBeVisible()
  })

  test('shows quantity controls after clicking add to basket', async ({ page }) => {
    const productDetailsPage = await ProductDetailsPage.verifyOnPage(page)
    await productDetailsPage.addToBasketButton.click()
    await expect(productDetailsPage.decreaseQuantityButton).toBeVisible()
    await expect(productDetailsPage.increaseQuantityButton).toBeVisible()
  })
})
