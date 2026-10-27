import { trace } from '@ministryofjustice/hmpps-azure-telemetry'
import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  CANTEEN_LANDING = 'CANTEEN_LANDING',
}

// Each audited user group has its own HMPPS audit queue
export enum AuditedUserGroup {
  STAFF = 'STAFF',
  PRISONER = 'PRISONER',
}

// Every audited action records its attempt, followed by its success or failure
export enum AuditOutcome {
  ATTEMPT = 'ATTEMPT',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

// Valid HMPPS Audit subject types
export enum SubjectType {
  PRISONER_ID = 'PRISONER_ID',
  USER_ID = 'USER_ID',
  SEARCH_TERM = 'SEARCH_TERM',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export interface HmppsAuditClients {
  staff: HmppsAuditClient
  prisoner: HmppsAuditClient
}

export interface PageViewEventDetails {
  who: string
  subjectId: string
  subjectType: SubjectType
  correlationId?: string
  details?: object
}

// Application Insights operation id, i.e. the trace id of the current request
const currentOperationId = (): string | undefined => trace.getActiveSpan()?.spanContext().traceId

export default class AuditService {
  constructor(private readonly hmppsAuditClients: HmppsAuditClients) {}

  // Audit failures are logged by the audit client but not rethrown, so they don't stop users using the service
  async logAuditEvent(event: AuditEvent, userGroup: AuditedUserGroup) {
    await this.clientFor(userGroup).sendMessage({ operationId: currentOperationId(), ...event }, false)
  }

  async logPageView(
    page: Page,
    outcome: AuditOutcome,
    eventDetails: PageViewEventDetails,
    userGroup: AuditedUserGroup,
  ) {
    await this.logAuditEvent({ ...eventDetails, what: `VIEW_${page}_${outcome}` }, userGroup)
  }

  private clientFor(userGroup: AuditedUserGroup): HmppsAuditClient {
    switch (userGroup) {
      case AuditedUserGroup.STAFF:
        return this.hmppsAuditClients.staff
      case AuditedUserGroup.PRISONER:
        return this.hmppsAuditClients.prisoner
      default:
        throw new Error(`No audit queue configured for user group: ${userGroup}`)
    }
  }
}
