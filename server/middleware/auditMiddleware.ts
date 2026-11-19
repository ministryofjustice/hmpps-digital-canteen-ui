import type { ErrorRequestHandler, Request, RequestHandler, Response } from 'express'
import AuditService, {
  AuditAction,
  AuditDetails,
  AuditedUserGroup,
  AuditOutcome,
  AuditSubject,
  SubjectType,
} from '../services/auditService'
import auditUserFor from '../utils/auditUser'

// What a request is audited as: `${action}_${target}_${outcome}`, about the subject, with the details
export interface AuditedRequest {
  action: AuditAction
  target: string
  // Defaults to the user's own subject
  subject?(req: Request, res: Response): AuditSubject
  details?(req: Request, res: Response): AuditDetails
}

type AuditOutcomeOnce = (outcome: AuditOutcome, details?: AuditDetails) => Promise<void>

const withoutEmpty = (details: AuditDetails): AuditDetails | undefined =>
  Object.keys(details).length ? details : undefined

/**
 * Audits a request: the attempt, then one outcome.
 *  - logAttempt runs first. It audits the attempt, then the outcome when the response ends: SUCCESS for a 2xx or 3xx
 *    response, otherwise FAILURE. The outcome includes any details the handler adds to res.locals.auditDetails
 *  - logError runs last. It audits FAILURE with the error message when the handler, or a guard, fails with an error
 */
export default function auditMiddleware(
  auditService: AuditService,
  audited: AuditedRequest,
): { logAttempt: RequestHandler; logError: ErrorRequestHandler } {
  const auditOutcomes = new WeakMap<Response, AuditOutcomeOnce>()

  const logAttempt: RequestHandler = async (req, res, next) => {
    const { who, userGroup } = auditUserFor(res.locals.user)

    // By default, prisoners act on their own data, and staff on no personal data
    const subject =
      audited.subject?.(req, res) ??
      (userGroup === AuditedUserGroup.PRISONER
        ? { subjectId: who, subjectType: SubjectType.PRISONER_ID }
        : { subjectId: 'NONE', subjectType: SubjectType.NOT_APPLICABLE })
    const requestDetails = audited.details?.(req, res) ?? {}

    const audit = (outcome: AuditOutcome, details: AuditDetails) =>
      auditService.logEvent(
        audited.action,
        audited.target,
        outcome,
        { who, ...subject, correlationId: req.id, details: withoutEmpty(details) },
        userGroup,
      )

    let outcomeAudited = false
    const auditOutcome: AuditOutcomeOnce = async (outcome, outcomeDetails) => {
      if (outcomeAudited) return
      outcomeAudited = true
      await audit(outcome, { ...requestDetails, ...res.locals.auditDetails, ...outcomeDetails })
    }
    auditOutcomes.set(res, auditOutcome)

    await audit(AuditOutcome.ATTEMPT, requestDetails)

    res.on('close', () => {
      if (!res.writableFinished) {
        auditOutcome(AuditOutcome.FAILURE, { failureReason: 'Connection closed before the response was sent' })
      } else if (res.statusCode >= 400) {
        auditOutcome(AuditOutcome.FAILURE, { failureReason: `Responded with HTTP ${res.statusCode}` })
      } else {
        auditOutcome(AuditOutcome.SUCCESS)
      }
    })

    next()
  }

  const logError: ErrorRequestHandler = async (error, _req, res, next) => {
    await auditOutcomes.get(res)?.(AuditOutcome.FAILURE, { failureReason: error.message })
    next(error)
  }

  return { logAttempt, logError }
}
