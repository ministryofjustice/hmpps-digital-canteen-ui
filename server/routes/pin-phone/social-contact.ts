import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'

export default function viewSocialContactsRoutes(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone/contacts/social-contact/:contact', async (req, res, _next) => {
    await auditService.logPageView(Page.SOCIAL_CONTACT, { who: res.locals.user.username, correlationId: req.id })

    return res.render('pages/pin-phone/social-contact')
  })

  return router
}
