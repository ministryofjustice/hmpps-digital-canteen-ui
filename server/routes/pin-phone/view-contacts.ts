import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../../services/auditService'
import paginationService from '../../services/paginationService'
import config from '../../config'
import PinPhoneService from '../../services/pinPhoneService'
import { PATHS } from '../../constants/paths'

export default function viewContactsRoutes(
  router: Router,
  auditService: AuditService,
  pinPhoneService: PinPhoneService,
): Router {
  router.get(PATHS.VIEW_CONTACTS, async (req, res, _next) => {
    await auditService.logPageView(Page.VIEW_CONTACTS, { who: res.locals.user.username, correlationId: req.id })

    const currentPage = Number.parseInt(req.query.page as string, 10) || 0
    const pageSize = 10
    const user = req.user as LaunchpadUser
    const allContacts = await pinPhoneService.retrieveContacts(user.userId)
    req.session.allContacts = allContacts
    const freeSupportNumbers = [
      [{ text: 'Samaritans' }, { text: '116 123' }, { text: 'Emotional support and crisis listening.' }],
      [
        { text: 'Frank' },
        { text: '0300 1236600' },
        { text: 'Non-judgmental information about legal and illegal drugs, alcohol, and volatile substances.' },
      ],
    ]

    if (allContacts.length > 0) {
      const sortedContacts = [...allContacts].sort((a, b) => a.name.localeCompare(b.name))
      const totalElements = sortedContacts.length
      const start = currentPage * pageSize
      const end = Math.min(start + pageSize, totalElements)
      const pageContacts = sortedContacts.slice(start, end)

      const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

      const pagination = paginationService.getPagination(
        {
          totalElements,
          page: currentPage,
          size: pageSize,
        },
        url,
      )

      const tableRows = pageContacts.map(contact => {
        const contactType = contact.contactType.toLowerCase()
        return [
          {
            html: `<a class="govuk-link govuk-link--no-underline" href="/pin-phone/view-contacts/${contactType}-contact/${contact.id}">${contact.name}</a>`,
          },
          { text: contact.phoneNumber },
          { text: contact.contactType },
        ]
      })

      return res.render('pages/pin-phone/view-contacts', {
        pinPhoneApps: config.prisonerAppsUrl,
        tableRows,
        freeSupportNumbers,
        pagination,
        hasContacts: true,
      })
    }

    return res.render('pages/pin-phone/view-contacts', {
      pinPhoneApps: config.prisonerAppsUrl,
      freeSupportNumbers,
      hasContacts: false,
    })
  })

  return router
}
