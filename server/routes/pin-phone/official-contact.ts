import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'

export default function viewOfficialContactsRoutes(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone/contacts/official-contact/:contact', async (req, res, _next) => {
    await auditService.logPageView(Page.OFFICIAL_CONTACT, { who: res.locals.user.username, correlationId: req.id })

    return res.render('pages/pin-phone/official-contact')
  })

  return router
}
