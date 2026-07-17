import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'

export default function pinPhoneRoutes(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone', async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_HOME, { who: res.locals.user.username, correlationId: req.id })

    // todo: hard coded username, will come from launchpad session later
    const userName = 'John'
    return res.render('pages/pin-phone', {
      userName,
      buyCreditsUrl: '/pin-phone/buy-credit',
      viewContactsUrl: '/pin-phone/contacts',
    })
  })

  return router
}
