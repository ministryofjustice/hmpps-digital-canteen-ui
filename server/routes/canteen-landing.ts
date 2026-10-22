import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../services/auditService'
import { PATHS } from '../constants/paths'
import TelemetryService from '../services/telemetryService'

export default function canteenRoutes(
  router: Router,
  auditService: AuditService,
  telemetryService: TelemetryService,
): Router {
  router.get(PATHS.LANDING_PAGE, async (req, res, _next) => {
    await auditService.logPageView(Page.CANTEEN_LANDING, { who: res.locals.user.username, correlationId: req.id })

    const user = req.user as LaunchpadUser
    const userName = user.username
    telemetryService.trackEvent('CANTEEN_LANDING', user, {
      prisonCode: 'CKI',
    })

    return res.render('pages/canteen-landing', {
      userName,
    })
  })

  return router
}
