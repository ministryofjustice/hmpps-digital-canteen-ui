import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import config from '../../config'

export default function viewSocialContactsRoutes(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone/contacts/social-contact/:contactId', async (req, res, _next) => {
    await auditService.logPageView(Page.SOCIAL_CONTACT, { who: res.locals.user.username, correlationId: req.id })

    const { contactId } = req.params
    // todo update when API is implemented
    const contact = {
      id: contactId,
      name: 'John Doe',
      dateAdded: '13 March 2026',
      type: 'Social',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '13 March 1888',
      relationship: 'Son',
      addressLine1: '123 fake street',
      addressLine2: 'fake town',
      townOrCity: 'fake city',
      postcode: 'BT1 XYZ',
      country: 'United Kingdom',
      telephoneNumber1: '0123456789',
      telephoneNumber2: '0987654321',
      status: 'In progress',
    }

    return res.render('pages/pin-phone/social-contact', {
      pinPhoneApps: config.prisonerAppsUrl,
      contact,
    })
  })

  return router
}
