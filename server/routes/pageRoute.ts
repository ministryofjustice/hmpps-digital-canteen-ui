import { RequestHandler, Router } from 'express'
import AuditService, { AuditAction } from '../services/auditService'
import auditMiddleware from '../middleware/auditMiddleware'
import { PageHandler } from './interfaces/pageHandler'

/**
 * Returns route(), which adds a page to the router so that every request to it is audited, including requests its
 * guards reject: each view as VIEW_<PAGE_NAME>_*, and each form submission as its POST_AUDIT describes
 */
export default function pageRoute(router: Router, auditService: AuditService) {
  return (path: string, handler: PageHandler, ...guards: RequestHandler[]) => {
    if (handler.POST && !handler.POST_AUDIT) {
      throw new Error(
        `${handler.PAGE_NAME} has a POST without POST_AUDIT, so its form submissions would not be audited`,
      )
    }

    // Bound, so a handler can use `this` in them whether they are methods or arrow functions
    const auditSubject = handler.auditSubject?.bind(handler)

    const view = auditMiddleware(auditService, {
      action: AuditAction.VIEW,
      target: handler.PAGE_NAME,
      subject: auditSubject,
    })
    router.get(path, view.logAttempt, ...guards, handler.GET.bind(handler), view.logError)

    if (handler.POST) {
      const { action, target, subject, details } = handler.POST_AUDIT
      const submission = auditMiddleware(auditService, {
        action,
        target,
        subject: subject?.bind(handler.POST_AUDIT) ?? auditSubject,
        details: details?.bind(handler.POST_AUDIT),
      })
      router.post(path, submission.logAttempt, ...guards, handler.POST.bind(handler), submission.logError)
    }
  }
}
