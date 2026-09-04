import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import config from '../../config'
import { PATHS } from '../../constants/paths'
import { convertToTitleCase } from '../../utils/utils'

export default function viewOfficialContactsRoutes(router: Router, auditService: AuditService): Router {
  router.get(PATHS.OFFICIAL_CONTACTS, async (req, res, _next) => {
    await auditService.logPageView(Page.OFFICIAL_CONTACT, { who: res.locals.user.username, correlationId: req.id })
    const contact = req.session.allContacts?.find(c => c.id === Number(req.params.contactId))
    const selectedContact = contact
      ? {
          ...contact,
          contactType: convertToTitleCase(contact.contactType),
        }
      : undefined

    return res.render('pages/pin-phone/official-contact', {
      pinPhoneApps: config.prisonerAppsUrl,
      selectedContact,
    })
  })

  return router
}
