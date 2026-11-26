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
})
