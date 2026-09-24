import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../../services/auditService'
import { PATHS } from '../../constants/paths'
import TelemetryService from '../../services/telemetryService'

export default function buyCreditConfirmation(
  router: Router,
  auditService: AuditService,
  telemetryService: TelemetryService,
): Router {
  router.get(PATHS.PIN_PHONE_CONFIRMATION, async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_BUY_CONFIRMATION, {
      who: res.locals.user.username,
      correlationId: req.id,
    })
    // reset buy credit session data
    delete req.session.requestedCreditAmountPounds
    delete req.session.amountType
    // get user
    const user = req.user as LaunchpadUser
    const dateBought = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    telemetryService.trackEvent('PIN_PHONE_CONFIRMATION', user, {
      prisonCode: user.establishment.agency_id,
    })
    return res.render('pages/pin-phone/buy-credit-confirmation', { dateBought })
  })

  return router
}
