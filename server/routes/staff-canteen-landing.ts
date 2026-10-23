import { RequestHandler, Router } from 'express'
import AuditService, { Page } from '../services/auditService'
import { PATHS } from '../constants/paths'
import TelemetryService from '../services/telemetryService'
import { HmppsUser } from '../interfaces/hmppsUser'

export default function staffCanteenRoutes(
  router: Router,
  auditService: AuditService,
  telemetryService: TelemetryService,
  portalGuard: RequestHandler,
): Router {
  router.get(PATHS.STAFF_LANDING_PAGE, portalGuard, async (req, res, _next) => {
    await auditService.logPageView(Page.STAFF_CANTEEN_LANDING, { who: res.locals.user.username, correlationId: req.id })

    const user = req.user as HmppsUser
    const userName = user.username
    telemetryService.trackEvent('STAFF_CANTEEN_LANDING', user, {
      prisonCode: 'CKI',
    })

    return res.render('pages/staff-canteen-landing', {
      userName,
    })
  })

  return router
}
