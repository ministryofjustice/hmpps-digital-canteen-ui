import { NextFunction, Request, Response } from 'express'
import { AuditAction, AuditDetails, AuditSubject, Page } from '../../services/auditService'

// How a form submission (POST) is audited, e.g. { action: AuditAction.CREATE, target: 'ORDER' } gives CREATE_ORDER_*
export interface FormSubmissionAudit {
  action: AuditAction.SEARCH | AuditAction.CREATE | AuditAction.EDIT | AuditAction.DELETE
  target: string
  // Who or what the submission is about. Defaults to the page's audit subject
  subject?(req: Request, res: Response): AuditSubject
  // E.g. the search's queryParams, or the edited entityId and changes. Sent with the attempt and the outcome
  details?(req: Request, res: Response): AuditDetails
}

/**
 * A page in the app. Every page is added with route() in routes/index.ts, which audits:
 *  - each view of the page as VIEW_<PAGE_NAME>_*
 *  - each submission of its form as POST_AUDIT describes, e.g. CREATE_ORDER_*
 * The handler can add outcome details, e.g. search results, to res.locals.auditDetails
 */
export interface PageHandler {
  PAGE_NAME: Page
  GET(req: Request, res: Response, next?: NextFunction): Promise<void>
  POST?(req: Request, res: Response, next?: NextFunction): Promise<void>
  // Required when the page has a POST
  POST_AUDIT?: FormSubmissionAudit
  // Who or what the page is about, e.g. the prisoner whose data a staff page shows. Defaults to the user's own subject
  auditSubject?(req: Request, res: Response): AuditSubject
}
