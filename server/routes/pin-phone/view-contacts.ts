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
  const allContacts: Contact[] = [
    { id: '1', name: 'Michael Smith', dateAdded: '13 March 2026', type: 'Social', status: 'Approved' },
    { id: '2', name: 'Davie Wilson', dateAdded: '13 March 2026', type: 'Social', status: 'Approved' },
    { id: '3', name: 'Jo Cooper', dateAdded: '11 March 2026', type: 'Social', status: 'Approved' },
    { id: '4', name: 'James Wright', dateAdded: '5 March 2026', type: 'Official', status: 'Approved' },
    { id: '5', name: 'Andrew Smith', dateAdded: '2 March 2026', type: 'Social', status: 'Approved' },
    { id: '6', name: 'Susie McKay', dateAdded: '2 March 2026', type: 'Official', status: 'Approved' },
    { id: '7', name: 'David Watt', dateAdded: '1 March 2026', type: 'Social', status: 'Approved' },
    { id: '8', name: 'Michael Wilson', dateAdded: '28 February 2026', type: 'Social', status: 'Approved' },
    { id: '9', name: 'Margaret Smith', dateAdded: '27 February 2026', type: 'Social', status: 'Approved' },
    { id: '10', name: 'Jimmy Smith', dateAdded: '26 February 2026', type: 'Official', status: 'Approved' },
    { id: '11', name: 'Karen Brown', dateAdded: '20 February 2026', type: 'Social', status: 'Pending' },
    { id: '12', name: 'Paul Murray', dateAdded: '18 February 2026', type: 'Official', status: 'Approved' },
    { id: '13', name: 'Sarah Connor', dateAdded: '15 February 2026', type: 'Social', status: 'Approved' },
    { id: '14', name: 'Thomas Reid', dateAdded: '12 February 2026', type: 'Social', status: 'Pending' },
    { id: '15', name: 'Laura Campbell', dateAdded: '10 February 2026', type: 'Official', status: 'Approved' },
    { id: '16', name: 'Robert Docherty', dateAdded: '8 February 2026', type: 'Social', status: 'Approved' },
    { id: '17', name: 'Emma Patterson', dateAdded: '5 February 2026', type: 'Social', status: 'Approved' },
    { id: '18', name: 'Craig Henderson', dateAdded: '3 February 2026', type: 'Official', status: 'Pending' },
    { id: '19', name: 'Fiona MacLeod', dateAdded: '1 February 2026', type: 'Social', status: 'Approved' },
    { id: '20', name: 'Derek Hamilton', dateAdded: '28 January 2026', type: 'Social', status: 'Approved' },
    { id: '21', name: 'Angela Stewart', dateAdded: '25 January 2026', type: 'Official', status: 'Approved' },
    { id: '22', name: 'Brian Kelly', dateAdded: '22 January 2026', type: 'Social', status: 'Approved' },
    { id: '23', name: 'Nicola Fraser', dateAdded: '20 January 2026', type: 'Social', status: 'Pending' },
    { id: '24', name: 'Gary Thomson', dateAdded: '17 January 2026', type: 'Social', status: 'Approved' },
    { id: '25', name: 'Heather Douglas', dateAdded: '15 January 2026', type: 'Official', status: 'Approved' },
    { id: '26', name: 'Alan Robertson', dateAdded: '12 January 2026', type: 'Social', status: 'Approved' },
    { id: '27', name: 'Moira Wallace', dateAdded: '10 January 2026', type: 'Social', status: 'Approved' },
    { id: '28', name: 'Colin Graham', dateAdded: '7 January 2026', type: 'Official', status: 'Pending' },
    { id: '29', name: 'Diane Mitchell', dateAdded: '5 January 2026', type: 'Social', status: 'Approved' },
    { id: '30', name: 'Steven Baird', dateAdded: '2 January 2026', type: 'Social', status: 'Approved' },
  ]

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
            html: `<a class="govuk-link" href="/pin-phone/contacts/${contactType}-contact/${contact.id}">${contact.name}</a>`,
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
