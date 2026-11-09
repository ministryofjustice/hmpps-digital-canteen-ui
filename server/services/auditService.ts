import { trace } from '@ministryofjustice/hmpps-azure-telemetry'
import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  CANTEEN_LANDING = 'CANTEEN_LANDING',
  STAFF_CANTEEN_LANDING = 'STAFF_CANTEEN_LANDING',
}

// Each audited user group has its own HMPPS audit queue
export enum AuditedUserGroup {
  STAFF = 'STAFF',
  PRISONER = 'PRISONER',
}

// HMPPS Audit event type prefixes: what the user did
export enum AuditAction {
  VIEW = 'VIEW',
  SEARCH = 'SEARCH',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  PRINT = 'PRINT',
  DOWNLOAD = 'DOWNLOAD',
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
  CRN = 'CRN',
  SEARCH_TERM = 'SEARCH_TERM',
  USER_ID = 'USER_ID',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  NOMINAL_ID = 'NOMINAL_ID',
  REPORT_ID = 'REPORT_ID',
}

// Who or what the audited action is about
export interface AuditSubject {
  subjectId: string
  subjectType: SubjectType
}

// The HMPPS Audit standard details: search parameters and results, the entity changed and its changes, failure reason
export interface AuditDetails {
  queryParams?: Record<string, unknown>
  results?: { resultCount: number; returnedSubjectIds: string[] }
  entityId?: string
  changes?: { field: string; oldValue?: unknown; newValue?: unknown }[]
  failureReason?: string
}

export interface HmppsAuditClients {
  staff: HmppsAuditClient
  prisoner: HmppsAuditClient
}

export interface AuditEventDetails extends AuditSubject {
  who: string
  correlationId?: string
  details?: AuditDetails
}

// Application Insights operation id, i.e. the trace id of the current request
const currentOperationId = (): string | undefined => trace.getActiveSpan()?.spanContext().traceId

export default class AuditService {
  constructor(private readonly hmppsAuditClients: HmppsAuditClients) {}

  // Audit failures are logged by the audit client but not rethrown, so they don't stop users using the service
  async logAuditEvent(event: AuditEvent, userGroup: AuditedUserGroup) {
    await this.clientFor(userGroup).sendMessage({ operationId: currentOperationId(), ...event }, false)
  }

  // Audits an action, e.g. VIEW_CANTEEN_LANDING_ATTEMPT or CREATE_ORDER_SUCCESS
  async logEvent(
    action: AuditAction,
    target: string,
    outcome: AuditOutcome,
    eventDetails: AuditEventDetails,
    userGroup: AuditedUserGroup,
  ) {
    await this.logAuditEvent({ ...eventDetails, what: `${action}_${target}_${outcome}` }, userGroup)
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
