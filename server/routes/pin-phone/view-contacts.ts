import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import paginationService from '../../services/paginationService'
import config from '../../config'

// todo: remove once API is implemented
interface Contact {
  id: string
  name: string
  dateAdded: string
  type: string
  status: string
}

interface PaginatedResponse {
  content: Contact[]
  totalElements: number
  page: number
  size: number
}

function getContacts(page: number, size: number): PaginatedResponse {
  const allContacts: Contact[] = []

  const sorted = [...allContacts].sort((a, b) => a.name.localeCompare(b.name))
  const start = page * size

  return {
    content: sorted.slice(start, start + size),
    totalElements: sorted.length,
    page,
    size,
  }
}

export default function viewContactsRoutes(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone/contacts', async (req, res, _next) => {
    await auditService.logPageView(Page.VIEW_CONTACTS, { who: res.locals.user.username, correlationId: req.id })

    const currentPage = Number.parseInt(req.query.page as string, 10) || 0
    const pageSize = 10
    // todo: update once API is implemented
    const response = getContacts(currentPage, pageSize)

    if (response.totalElements > 0) {
      const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

      const pagination = paginationService.getPagination(
        { totalElements: response.totalElements, page: currentPage, size: pageSize },
        url,
      )

      const tableRows = response.content.map(contact => {
        const contactType = contact.type.toLowerCase()
        return [
          {
            html: `<a class="govuk-link govuk-link--no-underline" href="/pin-phone/contacts/${contactType}-contact/${contact.id}">${contact.name}</a>`,
          },
          { text: contact.dateAdded },
          { text: contact.type },
        ]
      })

      return res.render('pages/pin-phone/view-contacts', {
        pinPhoneApps: config.prisonerAppsUrl,
        tableRows,
        pagination,
        hasContacts: true,
      })
    }

    return res.render('pages/pin-phone/view-contacts', {
      pinPhoneApps: config.prisonerAppsUrl,
      hasContacts: false,
    })
  })

  return router
}
