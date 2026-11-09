import AuditService, {
  AuditAction,
  AuditedUserGroup,
  AuditOutcome,
  HmppsAuditClients,
  Page,
  SubjectType,
} from './auditService'
import HmppsAuditClient from '../data/hmppsAuditClient'

jest.mock('../data/hmppsAuditClient')

describe('Audit service', () => {
  let hmppsAuditClients: jest.Mocked<HmppsAuditClients>
  let auditService: AuditService

  const newAuditClient = () =>
    new HmppsAuditClient({
      queueUrl: '',
      region: '',
      serviceName: '',
      enabled: true,
    }) as jest.Mocked<HmppsAuditClient>

  beforeEach(() => {
    hmppsAuditClients = {
      staff: newAuditClient(),
      prisoner: newAuditClient(),
    } as jest.Mocked<HmppsAuditClients>
    auditService = new AuditService(hmppsAuditClients)
  })

  describe('logAuditEvent', () => {
    const event = {
      what: 'AUDIT_EVENT',
      who: 'user1',
      subjectId: 'subject123',
      subjectType: 'exampleType',
      correlationId: 'request123',
      details: { extraDetails: 'example' },
    }

    it.each([
      [AuditedUserGroup.STAFF, 'staff'],
      [AuditedUserGroup.PRISONER, 'prisoner'],
    ] as const)('sends %s audit message to the %s audit queue only', async (userGroup, clientKey) => {
      await auditService.logAuditEvent(event, userGroup)

      expect(hmppsAuditClients[clientKey].sendMessage).toHaveBeenCalledWith(event, false)
      Object.entries(hmppsAuditClients)
        .filter(([key]) => key !== clientKey)
        .forEach(([, client]) => expect(client.sendMessage).not.toHaveBeenCalled())
    })

    it('throws for a user group with no audit queue', async () => {
      await expect(auditService.logAuditEvent(event, 'UNKNOWN' as unknown as AuditedUserGroup)).rejects.toThrow(
        'No audit queue configured for user group: UNKNOWN',
      )
    })
  })

  describe('logEvent', () => {
    it.each([
      [AuditAction.VIEW, Page.CANTEEN_LANDING, AuditOutcome.ATTEMPT, 'VIEW_CANTEEN_LANDING_ATTEMPT'],
      [AuditAction.VIEW, Page.CANTEEN_LANDING, AuditOutcome.SUCCESS, 'VIEW_CANTEEN_LANDING_SUCCESS'],
      [AuditAction.SEARCH, 'PRISONER', AuditOutcome.ATTEMPT, 'SEARCH_PRISONER_ATTEMPT'],
      [AuditAction.CREATE, 'ORDER', AuditOutcome.SUCCESS, 'CREATE_ORDER_SUCCESS'],
      [AuditAction.EDIT, 'ORDER', AuditOutcome.FAILURE, 'EDIT_ORDER_FAILURE'],
      [AuditAction.DELETE, 'ORDER', AuditOutcome.ATTEMPT, 'DELETE_ORDER_ATTEMPT'],
    ])(
      'sends a %s %s %s event as %s using the audit client for the user group',
      async (action, target, outcome, what) => {
        await auditService.logEvent(
          action,
          target,
          outcome,
          {
            who: 'A1234BC',
            subjectId: 'A1234BC',
            subjectType: SubjectType.PRISONER_ID,
            correlationId: 'request123',
            details: { entityId: 'order-1' },
          },
          AuditedUserGroup.PRISONER,
        )

        expect(hmppsAuditClients.prisoner.sendMessage).toHaveBeenCalledWith(
          {
            what,
            who: 'A1234BC',
            subjectId: 'A1234BC',
            subjectType: 'PRISONER_ID',
            correlationId: 'request123',
            details: { entityId: 'order-1' },
          },
          false,
        )
        expect(hmppsAuditClients.staff.sendMessage).not.toHaveBeenCalled()
      },
    )
  })
})
