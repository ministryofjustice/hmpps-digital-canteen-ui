import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../../services/auditService'
import { PATHS } from '../../constants/paths'

export default function pinPhoneRoutes(router: Router, auditService: AuditService): Router {
  router.get(PATHS.LANDING_PAGE, async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_LANDING, { who: res.locals.user.username, correlationId: req.id })

    // reset buy credit session data
    delete req.session.requestedCreditAmountPounds
    delete req.session.amountType

    const user = req.user as LaunchpadUser
    const userName = user.username
    return res.render('pages/pin-phone/pin-phone-landing', {
      userName,
      buyCreditsUrl: PATHS.BUY_CREDIT,
      viewContactsUrl: PATHS.VIEW_CONTACTS,
    })
  })

  return router
}
