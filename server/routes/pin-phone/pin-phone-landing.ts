import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../../services/auditService'

export default function pinPhoneRoutes(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone', async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_LANDING, { who: res.locals.user.username, correlationId: req.id })

    // reset buy credit session data
    delete req.session.creditAmount
    delete req.session.amountType

    const user = req.user as LaunchpadUser
    const userName = user.username
    return res.render('pages/pin-phone/pin-phone-landing', {
      userName,
      buyCreditsUrl: '/pin-phone/buy-credit',
      viewContactsUrl: '/pin-phone/view-contacts',
    })
  })

  return router
}
