import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import config from '../../config'
import { PATHS } from '../../constants/paths'

export default function viewSocialContactsRoutes(router: Router, auditService: AuditService): Router {
  router.get(PATHS.SOCIAL_CONTACTS, async (req, res, _next) => {
    await auditService.logPageView(Page.SOCIAL_CONTACT, { who: res.locals.user.username, correlationId: req.id })
    const selectedContact = req.session.allContacts?.find(c => c.id === Number(req.params.contactId))

    return res.render('pages/pin-phone/social-contact', {
      pinPhoneApps: config.prisonerAppsUrl,
      selectedContact,
    })
  })

  return router
}
