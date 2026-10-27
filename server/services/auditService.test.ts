import AuditService, { AuditedUserGroup, AuditOutcome, HmppsAuditClients, Page, SubjectType } from './auditService'
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

  describe('logPageView', () => {
    it.each([AuditOutcome.ATTEMPT, AuditOutcome.SUCCESS, AuditOutcome.FAILURE])(
      'sends a VIEW_ page event with the %s suffix using the audit client for the user group',
      async outcome => {
        await auditService.logPageView(
          Page.CANTEEN_LANDING,
          outcome,
          {
            who: 'A1234BC',
            subjectId: 'A1234BC',
            subjectType: SubjectType.PRISONER_ID,
            correlationId: 'request123',
            details: { extraDetails: 'example' },
          },
          AuditedUserGroup.PRISONER,
        )

        expect(hmppsAuditClients.prisoner.sendMessage).toHaveBeenCalledWith(
          {
            what: `VIEW_CANTEEN_LANDING_${outcome}`,
            who: 'A1234BC',
            subjectId: 'A1234BC',
            subjectType: 'PRISONER_ID',
            correlationId: 'request123',
            details: { extraDetails: 'example' },
          },
          false,
        )
        expect(hmppsAuditClients.staff.sendMessage).not.toHaveBeenCalled()
      },
    )
  })
})
