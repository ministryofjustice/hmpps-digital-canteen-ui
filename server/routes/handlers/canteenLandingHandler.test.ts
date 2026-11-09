import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import AuditService, {
  AuditAction,
  AuditedUserGroup,
  AuditOutcome,
  Page,
  SubjectType,
} from '../../services/auditService'
import TelemetryService from '../../services/telemetryService'
import { HmppsUser } from '../../interfaces/hmppsUser'

jest.mock('../../services/auditService')
jest.mock('../../services/telemetryService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const telemetryService = new TelemetryService() as jest.Mocked<TelemetryService>

// As Launchpad signs prisoners in: username and userId are the ID token sub (the prisoner number), displayName their name
const prisonerUser = {
  ...user,
  authSource: 'prisoner-auth',
  username: 'A1234BC',
  userId: 'A1234BC',
  displayName: 'John Smith',
} as HmppsUser
const staffUser = user

const appFor = (signedInUser: HmppsUser): Express =>
  appWithAllRoutes({
    services: {
      auditService,
      telemetryService,
    },
    userSupplier: () => signedInUser,
  })

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /canteen', () => {
  it("renders the landing page with the prisoner's name, not their prisoner number", async () => {
    const res = await request(appFor(prisonerUser)).get('/canteen').expect(200)

    expect(res.text).toContain('John Smith&#39;s Canteen')
    expect(res.text).not.toContain('A1234BC&#39;s Canteen')
    expect(telemetryService.trackEvent).toHaveBeenCalledWith('CANTEEN_LANDING', expect.anything(), {
      prisonCode: 'HEI',
    })
  })

  it.each([
    [
      'prisoner',
      prisonerUser,
      { who: 'A1234BC', subjectId: 'A1234BC', subjectType: SubjectType.PRISONER_ID },
      AuditedUserGroup.PRISONER,
    ],
    [
      'staff',
      staffUser,
      { who: 'user1', subjectId: 'NONE', subjectType: SubjectType.NOT_APPLICABLE },
      AuditedUserGroup.STAFF,
    ],
  ])(
    'audits the view attempt and success for a %s user against their audit queue',
    async (_userType, signedInUser, expectedSubject, expectedUserGroup) => {
      await request(appFor(signedInUser)).get('/canteen').expect(200)

      const expectedEventDetails = { ...expectedSubject, correlationId: expect.any(String) }

      expect(auditService.logEvent).toHaveBeenCalledTimes(2)
      expect(auditService.logEvent).toHaveBeenNthCalledWith(
        1,
        AuditAction.VIEW,
        Page.CANTEEN_LANDING,
        AuditOutcome.ATTEMPT,
        expectedEventDetails,
        expectedUserGroup,
      )
      expect(auditService.logEvent).toHaveBeenNthCalledWith(
        2,
        AuditAction.VIEW,
        Page.CANTEEN_LANDING,
        AuditOutcome.SUCCESS,
        expectedEventDetails,
        expectedUserGroup,
      )
    },
  )

  it('audits the view attempt and failure, with the reason, when the page fails', async () => {
    telemetryService.trackEvent.mockImplementation(() => {
      throw new Error('Telemetry failed')
    })

    await request(appFor(prisonerUser)).get('/canteen').expect(500)

    expect(auditService.logEvent).toHaveBeenCalledTimes(2)
    expect(auditService.logEvent).toHaveBeenLastCalledWith(
      AuditAction.VIEW,
      Page.CANTEEN_LANDING,
      AuditOutcome.FAILURE,
      expect.objectContaining({ details: { failureReason: 'Telemetry failed' } }),
      AuditedUserGroup.PRISONER,
    )
  })
})
