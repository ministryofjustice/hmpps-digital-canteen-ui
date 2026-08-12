import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import config from '../../config'

export default function viewOfficialContactsRoutes(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone/view-contacts/official-contact/:contactId', async (req, res, _next) => {
    await auditService.logPageView(Page.OFFICIAL_CONTACT, { who: res.locals.user.username, correlationId: req.id })

    const selectedContact = req.session.allContacts?.find(c => c.id === req.params.contactId)

    return res.render('pages/pin-phone/official-contact', {
      pinPhoneApps: config.prisonerAppsUrl,
      selectedContact,
    })
  })

  return router
}
