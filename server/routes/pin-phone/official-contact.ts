import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import config from '../../config'
import { PATHS } from '../../constants/paths'

export default function viewOfficialContactsRoutes(router: Router, auditService: AuditService): Router {
  router.get(PATHS.OFFICIAL_CONTACTS, async (req, res, _next) => {
    await auditService.logPageView(Page.OFFICIAL_CONTACT, { who: res.locals.user.username, correlationId: req.id })
    const selectedContact = req.session.allContacts?.find(c => c.id === Number(req.params.contactId))

    return res.render('pages/pin-phone/official-contact', {
      pinPhoneApps: config.prisonerAppsUrl,
      selectedContact,
    })
  })

  return router
}
