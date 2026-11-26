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
    await auditService.logPageView(Page.CANTEEN_HOME_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const user = req.user as LaunchpadUser
    const userName = user.idToken.name
    telemetryService.trackEvent('CANTEEN_HOME_PAGE', user, {
      prisonCode: user.establishment.agency_id,
    })

    const basket = {
      total: '10.00',
      itemCount: 10,
    }

    return res.render('pages/canteen-home-page', {
      userName,
      basket,
      hoursRemaining: 24,
      spendBalance: '30.00',
    })
  })

  return router
}
