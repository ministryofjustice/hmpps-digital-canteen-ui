import { Page } from '@playwright/test'
import tokenVerification from './mockApis/tokenVerification'
import hmppsAuth, { type UserToken } from './mockApis/hmppsAuth'
import { resetStubs } from './mockApis/wiremock'
import prisonerAuth from './mockApis/prisonerAuth'

export { resetStubs }

const DEFAULT_ROLES = ['ROLE_SOME_REQUIRED_ROLE']

export const attemptHmppsAuthLogin = async (page: Page) => {
  await page.goto('/')
  page.locator('h1', { hasText: 'Sign in' })
  const url = await hmppsAuth.getSignInUrl()
  await page.goto(url)
}

export const loginWithHmppsAuth = async (
  page: Page,
  { name, roles = DEFAULT_ROLES, active = true, authSource = 'nomis' }: UserToken & { active?: boolean } = {},
) => {
  await Promise.all([
    hmppsAuth.favicon(),
    hmppsAuth.stubSignInPage(),
    hmppsAuth.stubSignOutPage(),
    hmppsAuth.token({ name, roles, authSource }),
    tokenVerification.stubVerifyToken(active),
  ])
  await attemptHmppsAuthLogin(page)
}

export const attemptPrisonerAuthLogin = async (page: Page) => {
  await page.goto('/')
  await page.waitForURL('**/launchpadauth/v1/oauth2/authorize**')
  const url = await prisonerAuth.getSignInUrl()
  await page.goto(url)
}

export const loginWithPrisonerAuth = async (
  page: Page,
  {
    name = 'A TestUser',
    establishmentCode = 'BNI',
    tokenExpiresInSeconds = 9999,
    active = true,
    roles = DEFAULT_ROLES,
  }: {
    active?: boolean
    roles?: string[]
    name?: string
    establishmentCode?: string
    tokenExpiresInSeconds?: number
  } = {},
) => {
  await Promise.all([
    prisonerAuth.favicon(),
    prisonerAuth.stubSignInPage(),
    prisonerAuth.token({ name, establishmentCode, expiresInSeconds: tokenExpiresInSeconds }),
    hmppsAuth.token({ name, roles, authSource: 'nomis' }),
    tokenVerification.stubVerifyToken(active),
  ])
  await attemptPrisonerAuthLogin(page)
}
