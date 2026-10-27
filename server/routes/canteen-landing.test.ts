import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService, { AuditedUserGroup, AuditOutcome, Page, SubjectType } from '../services/auditService'
import TelemetryService from '../services/telemetryService'
import { HmppsUser } from '../interfaces/hmppsUser'

jest.mock('../services/auditService')
jest.mock('../services/telemetryService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const telemetryService = new TelemetryService() as jest.Mocked<TelemetryService>

const prisonerUser = { ...user, authSource: 'prisoner-auth', userId: 'A1234BC', username: 'John Smith' } as HmppsUser
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

      expect(auditService.logPageView).toHaveBeenCalledTimes(2)
      expect(auditService.logPageView).toHaveBeenNthCalledWith(
        1,
        Page.CANTEEN_LANDING,
        AuditOutcome.ATTEMPT,
        expectedEventDetails,
        expectedUserGroup,
      )
      expect(auditService.logPageView).toHaveBeenNthCalledWith(
        2,
        Page.CANTEEN_LANDING,
        AuditOutcome.SUCCESS,
        expectedEventDetails,
        expectedUserGroup,
      )
    },
  )
})
