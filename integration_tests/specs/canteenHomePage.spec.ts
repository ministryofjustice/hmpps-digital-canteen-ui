import { expect, test } from '@playwright/test'
import { loginWithPrisonerAuth } from '../testUtils'
import CanteenHomePage from '../pages/canteenHomePage'

test.describe('Canteen home page', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithPrisonerAuth(page)
    await page.goto('/canteen')
  })

  test('can see page heading with username', async ({ page }) => {
    await CanteenHomePage.verifyOnPage(page)
    await expect(page.locator('h1')).toContainText("A TestUser's Canteen")
  })

  test('can see all expected tabs', async ({ page }) => {
    const canteenPage = await CanteenHomePage.verifyOnPage(page)

    const tabs = (await canteenPage.items.allTextContents()).map(text => text.trim())
    expect(tabs).toEqual(['Shop Canteen', 'Current order', 'Previous orders'])
  })

  test('can see summary cards', async ({ page }) => {
    const canteenHomePage = await CanteenHomePage.verifyOnPage(page)
    // Verify summary card labels
    await expect(canteenHomePage.summaryLabels.nth(0)).toHaveText('Canteen spends balance')
    await expect(canteenHomePage.summaryLabels.nth(1)).toContainText('Basket total')
    await expect(canteenHomePage.summaryLabels.nth(2)).toHaveText('Canteen closes on')
    await expect(canteenHomePage.summaryLabels.nth(3)).toHaveText('You have')
    // Verify summary card values
    await expect(canteenHomePage.summaryValues.nth(0)).toContainText('£')
    await expect(canteenHomePage.summaryValues.nth(1)).toContainText('£')
    await expect(canteenHomePage.summaryValues.nth(2)).toContainText('Friday')
    await expect(canteenHomePage.summaryValues.nth(3)).toContainText('hours left to order')
  })

  test('can see search component', async ({ page }) => {
    const canteenPage = await CanteenHomePage.verifyOnPage(page)
    await expect(canteenPage.searchLabel).toHaveText('Search for products')
    await expect(canteenPage.searchHint).toHaveText('You can search by name or description')
    await expect(canteenPage.searchInput).toBeVisible()
    await expect(canteenPage.searchButton).toBeVisible()
    await expect(canteenPage.searchButton).toHaveText('Search')
  })

  // The product catalogue endpoints aren't in the real API yet, so the catalogue is the app's mock API responses
  // (server/data/mocks). When they're ready, stub them in mockApis/digitalCanteenApi.ts and update these tests

  test('can see the categories, with All products active', async ({ page }) => {
    const canteenPage = await CanteenHomePage.verifyOnPage(page)

    const categories = (await canteenPage.categories.allTextContents()).map(text => text.trim())
    expect(categories).toHaveLength(14)
    expect(categories.slice(0, 3)).toEqual(['All products (159)', 'Batteries (2)', 'Biscuits and bakery (15)'])
    await expect(canteenPage.activeCategory).toHaveText('All products (159)')
  })

  test('can see the products', async ({ page }) => {
    const canteenPage = await CanteenHomePage.verifyOnPage(page)

    await expect(canteenPage.productsHeading).toHaveText('All products (159)')
    await expect(canteenPage.productCards).toHaveCount(12)

    const stamp = canteenPage.productCards.first()
    await expect(stamp.getByRole('link', { name: '10p Postage Stamp' })).toBeVisible()
    await expect(stamp.getByText('No allergens')).toBeVisible()
    await expect(stamp.getByText('£0.10')).toBeVisible()
    await expect(stamp.getByRole('button', { name: 'Add to basket 10p Postage Stamp' })).toBeVisible()
  })

  test("can see a product's allergens", async ({ page }) => {
    await page.goto('/canteen?category=sweets-and-snacks')
    const canteenPage = await CanteenHomePage.verifyOnPage(page)

    const chocolate = canteenPage.productCards.filter({ hasText: 'Milk Chocolate Bar' })
    await expect(chocolate.getByText('Contains: milk, soya')).toBeVisible()
  })

  test('can see the page links', async ({ page }) => {
    const canteenPage = await CanteenHomePage.verifyOnPage(page)

    await expect(canteenPage.pagination.getByRole('link', { name: 'Page 14' })).toBeVisible()
    await expect(canteenPage.pagination.getByRole('link', { name: /Next/ })).toHaveAttribute('href', '/canteen?page=2')
  })
})
