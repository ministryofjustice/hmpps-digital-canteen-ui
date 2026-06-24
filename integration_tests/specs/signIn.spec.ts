import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import exampleApi from '../mockApis/exampleApi'

import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import HomePage from '../pages/homePage'
import prisonerAuth from '../mockApis/PrisonerAuth'

test.describe('SignIn', () => {
  test.use({
    baseURL: 'http://localhost:3007',
  })
  test.beforeEach(async () => {
    await exampleApi.stubExampleTime()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await prisonerAuth.stubSignInPage()
    await page.goto('/')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    await prisonerAuth.stubSignInPage()
    await page.goto('/sign-in')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('User name visible in header', async ({ page }) => {
    await loginWithPrisonerAuth(page, { name: 'A TestUser' })

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.usersName).toHaveText('A. Testuser')
  })

  test('Phase banner visible in header', async ({ page }) => {
    await loginWithPrisonerAuth(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(page.getByText('dev')).toBeVisible()
  })

  test('User can sign out', async ({ page }) => {
    await loginWithPrisonerAuth(page)

    const homePage = await HomePage.verifyOnPage(page)
    await homePage.signOut()

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('User can manage their details', async ({ page }) => {
    await loginWithPrisonerAuth(page, { name: 'A TestUser' })
    await expect(page.getByTestId('manageDetails')).toBeVisible()
  })

  test('Token verification failure takes user to sign in page', async ({ page }) => {
    await loginWithPrisonerAuth(page, { tokenExpiresInSeconds: -1 })

    await expect(page.getByRole('heading')).toHaveText('Authorisation Error')
  })

  test('Token verification failure clears user session', async ({ page }) => {
    await loginWithPrisonerAuth(page, { name: 'A TestUser', tokenExpiresInSeconds: -1 })

    await expect(page.getByRole('heading')).toHaveText('Authorisation Error')

    await loginWithPrisonerAuth(page, { name: 'Some OtherTestUser', active: true })

    const homePage = await HomePage.verifyOnPage(page)
    await expect(homePage.usersName).toHaveText('S. OtherTestUser')
  })
})
