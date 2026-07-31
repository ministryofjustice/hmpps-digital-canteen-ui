import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import config from '../../config'
import { ROUTE_PATHS } from '../../constants/ROUTE_PATHS'

export default function viewOfficialContactsRoutes(router: Router, auditService: AuditService): Router {
  router.get(ROUTE_PATHS.VIEW_OFFICIAL_CONTACTS, async (req, res, _next) => {
    await auditService.logPageView(Page.OFFICIAL_CONTACT, { who: res.locals.user.username, correlationId: req.id })

    const { contactId } = req.params
    // todo update when API is implemented
    const contact = {
      id: contactId,
      name: 'John Doe',
      dateAdded: '13 March 2026',
      type: 'Official',
      firstName: 'John',
      lastName: 'Doe',
      organisation: 'Fake Solicitor inc',
      relationship: 'Solicitor',
      telephoneNumber1: '0123456789',
      telephoneNumber2: '0987654321',
    }

    return res.render('pages/pin-phone/official-contact', {
      pinPhoneApps: config.prisonerAppsUrl,
      contact,
    })
  })

  return router
}
