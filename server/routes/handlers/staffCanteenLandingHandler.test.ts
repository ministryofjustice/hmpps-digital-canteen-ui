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
import { PortalType } from '../../@types/portalTypes'

jest.mock('../../services/auditService')
jest.mock('../../services/telemetryService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const telemetryService = new TelemetryService() as jest.Mocked<TelemetryService>

const appFor = (portalType: PortalType): Express =>
  appWithAllRoutes({
    services: {
      auditService,
      telemetryService,
    },
    userSupplier: () => user,
    portalType,
  })

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /staff-canteen', () => {
  it("renders the staff landing page with the user's name and audits the view against the staff audit queue", async () => {
    const res = await request(appFor('staff')).get('/staff-canteen').expect(200)

    expect(res.text).toContain('First Last&#39;s Canteen')
    expect(telemetryService.trackEvent).toHaveBeenCalledWith('STAFF_CANTEEN_LANDING', expect.anything(), {})

    const expectedEventDetails = {
      who: 'user1',
      subjectId: 'NONE',
      subjectType: SubjectType.NOT_APPLICABLE,
      correlationId: expect.any(String),
    }
    expect(auditService.logEvent).toHaveBeenCalledTimes(2)
    expect(auditService.logEvent).toHaveBeenNthCalledWith(
      1,
      AuditAction.VIEW,
      Page.STAFF_CANTEEN_LANDING,
      AuditOutcome.ATTEMPT,
      expectedEventDetails,
      AuditedUserGroup.STAFF,
    )
    expect(auditService.logEvent).toHaveBeenNthCalledWith(
      2,
      AuditAction.VIEW,
      Page.STAFF_CANTEEN_LANDING,
      AuditOutcome.SUCCESS,
      expectedEventDetails,
      AuditedUserGroup.STAFF,
    )
  })

  it('audits the view attempt and failure when the portal guard rejects a request from the prisoner portal', async () => {
    await request(appFor('prisoner')).get('/staff-canteen').expect(404)

    expect(auditService.logEvent).toHaveBeenCalledTimes(2)
    expect(auditService.logEvent).toHaveBeenLastCalledWith(
      AuditAction.VIEW,
      Page.STAFF_CANTEEN_LANDING,
      AuditOutcome.FAILURE,
      expect.objectContaining({ details: { failureReason: 'Responded with HTTP 404' } }),
      AuditedUserGroup.STAFF,
    )
    expect(telemetryService.trackEvent).not.toHaveBeenCalled()
  })
})
