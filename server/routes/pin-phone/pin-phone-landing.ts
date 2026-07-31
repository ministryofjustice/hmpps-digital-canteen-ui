import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import { ROUTE_PATHS } from '../../constants/ROUTE_PATHS'

export default function pinPhoneRoutes(router: Router, auditService: AuditService): Router {
  router.get(ROUTE_PATHS.LANDING, async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_LANDING, { who: res.locals.user.username, correlationId: req.id })

    // reset buy credit session data
    delete req.session.creditAmount
    delete req.session.amountType

    // todo: hard coded username, will come from launchpad session later
    const userName = 'John'
    return res.render('pages/pin-phone/pin-phone-landing', {
      userName,
      buyCreditsUrl: ROUTE_PATHS.BUY_CREDIT,
      viewContactsUrl: ROUTE_PATHS.VIEW_CONTACTS,
    })
  })

  return router
}
