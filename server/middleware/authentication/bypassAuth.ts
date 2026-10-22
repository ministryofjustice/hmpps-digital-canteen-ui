import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import { HmppsUser, PrisonUser } from '../../interfaces/hmppsUser'

const fakePrisoner = {
  sub: 'G3682UE',
  username: 'John Doe',
  authSource: 'prisoner-auth',
  token: 'fake-token',
  displayName: 'Dev User',
  givenName: 'John',
  familyName: 'Doe',
  userId: 'G3682UE',
  idToken: { name: 'John Doe' },
  userRoles: [],
  booking: { id: '12345' },
  establishment: { agency_id: 'CKI', name: 'Cookham Wood (HMP)' },
} as unknown as LaunchpadUser

const fakeStaff = {
  username: 'DEV_STAFF',
  authSource: 'nomis',
  token: 'fake-token',
  userUuid: '11111111-1111-1111-1111-111111111111',
  userId: '1234',
  staffId: 1234,
  name: 'Dev Staff',
  displayName: 'Dev Staff',
  userRoles: ['DIGITAL_CANTEEN_STAFF'],
  activeCaseLoadId: 'CKI',
  caseLoads: ['CKI'],
} as PrisonUser

/**
 * Local-only bypass (BYPASS_AUTH=true in .env).
 */
export default function bypassAuth(): Router {
  const router = Router()

  router.use((req, res, next) => {
    req.user = (req.portalType === 'staff' ? fakeStaff : fakePrisoner) as Express.User
    req.isAuthenticated = function faked(): this is Express.AuthenticatedRequest {
      return true
    }
    res.locals.user = req.user as HmppsUser
    next()
  })

  return router
}
