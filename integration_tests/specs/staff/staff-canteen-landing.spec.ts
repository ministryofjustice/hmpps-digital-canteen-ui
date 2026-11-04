import { test, expect } from '@playwright/test'
import { loginWithHmppsAuth } from '../../testUtils'
import StaffCanteenLandingPage from '../../pages/staff/staffCanteenLandingPage'
import config from '../../../server/config'

test.describe('Staff landing home page', () => {
  test.use({
    baseURL: 'http://staff.localhost:3007',
  })

  test.beforeEach(async ({ page }) => {
    await loginWithHmppsAuth(page, { name: 'A TestUser' })
    await page.goto('/staff-canteen')
  })

  test('can see page heading with username', async ({ page }) => {
    await StaffCanteenLandingPage.verifyOnPage(page)
    await expect(page.locator('h1')).toContainText('Canteen')
  })

  test('can see buy credit card', async ({ page }) => {
    const staffLandingPage = await StaffCanteenLandingPage.verifyOnPage(page)
    await expect(staffLandingPage.staffCard).toContainText('STAFF')
  })

  test('link to home', async ({ page }) => {
    const staffLandingPage = await StaffCanteenLandingPage.verifyOnPage(page)
    await expect(staffLandingPage.breadcrumbHome).toHaveAttribute('href', config.launchpadHome)
  })
})
