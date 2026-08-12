import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import paginationService from '../../services/paginationService'
import config from '../../config'

// todo: remove once API is implemented
export interface Contact {
  id: string
  name: string
  dateAdded: string
  type: string
  status: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  relationship?: string
  addressLine1?: string
  addressLine2?: string
  townOrCity?: string
  postcode?: string
  country?: string
  organisation?: string
  telephoneNumber1?: string
  telephoneNumber2?: string
}

interface PaginatedResponse {
  content: Contact[]
  totalElements: number
  page: number
  size: number
}

function getContacts(page: number, size: number): PaginatedResponse {
  const allContacts: Contact[] = [
    { id: '1', name: 'Michael Smith', firstName: 'Michael', lastName: 'Smith', dateAdded: '13 March 2026', type: 'Social', status: 'Approved', dateOfBirth: '5 June 1985', relationship: 'Brother', addressLine1: '12 Oak Avenue', addressLine2: 'Castletown', townOrCity: 'Leeds', postcode: 'LS1 2AB', country: 'United Kingdom', telephoneNumber1: '0113 234 5678', telephoneNumber2: '07700 900123' },
    { id: '2', name: 'Davie Wilson', firstName: 'Davie', lastName: 'Wilson', dateAdded: '13 March 2026', type: 'Social', status: 'Approved', dateOfBirth: '22 January 1990', relationship: 'Friend', addressLine1: '8 Elm Street', addressLine2: '', townOrCity: 'Glasgow', postcode: 'G1 3PQ', country: 'United Kingdom', telephoneNumber1: '0141 345 6789', telephoneNumber2: '' },
    { id: '3', name: 'Jo Cooper', firstName: 'Jo', lastName: 'Cooper', dateAdded: '11 March 2026', type: 'Social', status: 'Approved', dateOfBirth: '30 September 1978', relationship: 'Partner', addressLine1: '45 High Street', addressLine2: 'Flat 2B', townOrCity: 'Manchester', postcode: 'M1 4RS', country: 'United Kingdom', telephoneNumber1: '0161 456 7890', telephoneNumber2: '07700 900456' },
    { id: '4', name: 'James Wright', firstName: 'James', lastName: 'Wright', dateAdded: '5 March 2026', type: 'Official', status: 'Approved', organisation: 'Wright & Co Solicitors', relationship: 'Solicitor', telephoneNumber1: '020 7946 0958', telephoneNumber2: '020 7946 0959' },
    { id: '5', name: 'Andrew Smith', firstName: 'Andrew', lastName: 'Smith', dateAdded: '2 March 2026', type: 'Social', status: 'Approved', dateOfBirth: '14 April 1982', relationship: 'Father', addressLine1: '3 Birch Lane', addressLine2: '', townOrCity: 'Birmingham', postcode: 'B2 5TU', country: 'United Kingdom', telephoneNumber1: '0121 567 8901', telephoneNumber2: '' },
    { id: '6', name: 'Susie McKay', firstName: 'Susie', lastName: 'McKay', dateAdded: '2 March 2026', type: 'Official', status: 'Approved', organisation: 'HMP Moorland', relationship: 'Offender Manager', telephoneNumber1: '01onal 678 9012', telephoneNumber2: '' },
    { id: '7', name: 'David Watt', firstName: 'David', lastName: 'Watt', dateAdded: '1 March 2026', type: 'Social', status: 'Approved', dateOfBirth: '8 December 1995', relationship: 'Friend', addressLine1: '67 Castle Road', addressLine2: 'Newlands', townOrCity: 'Edinburgh', postcode: 'EH1 6VW', country: 'United Kingdom', telephoneNumber1: '0131 678 9012', telephoneNumber2: '' },
    { id: '8', name: 'Michael Wilson', firstName: 'Michael', lastName: 'Wilson', dateAdded: '28 February 2026', type: 'Social', status: 'Approved', dateOfBirth: '17 July 1988', relationship: 'Cousin', addressLine1: '29 Park View', addressLine2: '', townOrCity: 'Liverpool', postcode: 'L1 7XY', country: 'United Kingdom', telephoneNumber1: '0151 789 0123', telephoneNumber2: '07700 900789' },
    { id: '9', name: 'Margaret Smith', firstName: 'Margaret', lastName: 'Smith', dateAdded: '27 February 2026', type: 'Social', status: 'Approved', dateOfBirth: '3 March 1960', relationship: 'Mother', addressLine1: '3 Birch Lane', addressLine2: '', townOrCity: 'Birmingham', postcode: 'B2 5TU', country: 'United Kingdom', telephoneNumber1: '0121 567 8901', telephoneNumber2: '' },
    { id: '10', name: 'Jimmy Smith', firstName: 'Jimmy', lastName: 'Smith', dateAdded: '26 February 2026', type: 'Official', status: 'Approved', organisation: 'Citizens Advice Bureau', relationship: 'Adviser', telephoneNumber1: '0344 411 1444', telephoneNumber2: '' },
    { id: '11', name: 'Karen Brown', firstName: 'Karen', lastName: 'Brown', dateAdded: '20 February 2026', type: 'Social', status: 'Pending', dateOfBirth: '25 November 1992', relationship: 'Friend', addressLine1: '14 Queen Street', addressLine2: '', townOrCity: 'Cardiff', postcode: 'CF1 8ZA', country: 'United Kingdom', telephoneNumber1: '029 2089 0123', telephoneNumber2: '' },
    { id: '12', name: 'Paul Murray', firstName: 'Paul', lastName: 'Murray', dateAdded: '18 February 2026', type: 'Official', status: 'Approved', organisation: 'Murray Legal Services', relationship: 'Solicitor', telephoneNumber1: '0141 890 1234', telephoneNumber2: '0141 890 1235' },
    { id: '13', name: 'Sarah Connor', firstName: 'Sarah', lastName: 'Connor', dateAdded: '15 February 2026', type: 'Social', status: 'Approved', dateOfBirth: '12 August 1987', relationship: 'Sister', addressLine1: '22 River Walk', addressLine2: 'Riverside', townOrCity: 'Bristol', postcode: 'BS1 3BC', country: 'United Kingdom', telephoneNumber1: '0117 901 2345', telephoneNumber2: '' },
    { id: '14', name: 'Thomas Reid', firstName: 'Thomas', lastName: 'Reid', dateAdded: '12 February 2026', type: 'Social', status: 'Pending', dateOfBirth: '1 February 1975', relationship: 'Uncle', addressLine1: '9 Mill Road', addressLine2: '', townOrCity: 'Dundee', postcode: 'DD1 4DE', country: 'United Kingdom', telephoneNumber1: '01382 012 345', telephoneNumber2: '' },
    { id: '15', name: 'Laura Campbell', firstName: 'Laura', lastName: 'Campbell', dateAdded: '10 February 2026', type: 'Official', status: 'Approved', organisation: 'Shelter Scotland', relationship: 'Housing Adviser', telephoneNumber1: '0808 800 4444', telephoneNumber2: '' },
    { id: '16', name: 'Robert Docherty', firstName: 'Robert', lastName: 'Docherty', dateAdded: '8 February 2026', type: 'Social', status: 'Approved', dateOfBirth: '19 October 1993', relationship: 'Friend', addressLine1: '51 Station Road', addressLine2: 'Flat 4', townOrCity: 'Aberdeen', postcode: 'AB1 5EF', country: 'United Kingdom', telephoneNumber1: '01224 123 456', telephoneNumber2: '' },
    { id: '17', name: 'Emma Patterson', firstName: 'Emma', lastName: 'Patterson', dateAdded: '5 February 2026', type: 'Social', status: 'Approved', dateOfBirth: '7 May 1991', relationship: 'Partner', addressLine1: '33 Church Lane', addressLine2: '', townOrCity: 'Nottingham', postcode: 'NG1 6FG', country: 'United Kingdom', telephoneNumber1: '0115 234 5678', telephoneNumber2: '07700 900234' },
    { id: '18', name: 'Craig Henderson', firstName: 'Craig', lastName: 'Henderson', dateAdded: '3 February 2026', type: 'Official', status: 'Pending', organisation: 'Henderson & Partners', relationship: 'Solicitor', telephoneNumber1: '0131 345 6789', telephoneNumber2: '' },
    { id: '19', name: 'Fiona MacLeod', firstName: 'Fiona', lastName: 'MacLeod', dateAdded: '1 February 2026', type: 'Social', status: 'Approved', dateOfBirth: '28 June 1983', relationship: 'Friend', addressLine1: '7 Harbour View', addressLine2: '', townOrCity: 'Inverness', postcode: 'IV1 7GH', country: 'United Kingdom', telephoneNumber1: '01463 456 789', telephoneNumber2: '' },
    { id: '20', name: 'Derek Hamilton', firstName: 'Derek', lastName: 'Hamilton', dateAdded: '28 January 2026', type: 'Social', status: 'Approved', dateOfBirth: '15 December 1979', relationship: 'Brother', addressLine1: '18 King Street', addressLine2: 'Suite 3', townOrCity: 'Perth', postcode: 'PH1 8HJ', country: 'United Kingdom', telephoneNumber1: '01738 567 890', telephoneNumber2: '07700 900567' },
    { id: '21', name: 'Angela Stewart', firstName: 'Angela', lastName: 'Stewart', dateAdded: '25 January 2026', type: 'Official', status: 'Approved', organisation: 'Jobcentre Plus', relationship: 'Work Coach', telephoneNumber1: '0345 604 3719', telephoneNumber2: '' },
    { id: '22', name: 'Brian Kelly', firstName: 'Brian', lastName: 'Kelly', dateAdded: '22 January 2026', type: 'Social', status: 'Approved', dateOfBirth: '9 September 1986', relationship: 'Friend', addressLine1: '40 Bridge Street', addressLine2: '', townOrCity: 'Stirling', postcode: 'FK1 9JK', country: 'United Kingdom', telephoneNumber1: '01786 678 901', telephoneNumber2: '' },
    { id: '23', name: 'Nicola Fraser', firstName: 'Nicola', lastName: 'Fraser', dateAdded: '20 January 2026', type: 'Social', status: 'Pending', dateOfBirth: '4 April 1994', relationship: 'Friend', addressLine1: '6 Forest Drive', addressLine2: 'Craiglockhart', townOrCity: 'Edinburgh', postcode: 'EH2 0KL', country: 'United Kingdom', telephoneNumber1: '0131 789 0123', telephoneNumber2: '' },
    { id: '24', name: 'Gary Thomson', firstName: 'Gary', lastName: 'Thomson', dateAdded: '17 January 2026', type: 'Social', status: 'Approved', dateOfBirth: '21 January 1981', relationship: 'Friend', addressLine1: '15 Market Square', addressLine2: '', townOrCity: 'Falkirk', postcode: 'FK1 1LM', country: 'United Kingdom', telephoneNumber1: '01324 890 123', telephoneNumber2: '' },
    { id: '25', name: 'Heather Douglas', firstName: 'Heather', lastName: 'Douglas', dateAdded: '15 January 2026', type: 'Official', status: 'Approved', organisation: 'NACRO', relationship: 'Resettlement Worker', telephoneNumber1: '0300 123 1999', telephoneNumber2: '' },
    { id: '26', name: 'Alan Robertson', firstName: 'Alan', lastName: 'Robertson', dateAdded: '12 January 2026', type: 'Social', status: 'Approved', dateOfBirth: '11 March 1977', relationship: 'Friend', addressLine1: '28 Victoria Road', addressLine2: '', townOrCity: 'Kilmarnock', postcode: 'KA1 2MN', country: 'United Kingdom', telephoneNumber1: '01563 901 234', telephoneNumber2: '' },
    { id: '27', name: 'Moira Wallace', firstName: 'Moira', lastName: 'Wallace', dateAdded: '10 January 2026', type: 'Social', status: 'Approved', dateOfBirth: '16 July 1965', relationship: 'Aunt', addressLine1: '4 Meadow Close', addressLine2: 'Thornton', townOrCity: 'Fife', postcode: 'KY1 3NP', country: 'United Kingdom', telephoneNumber1: '01592 012 345', telephoneNumber2: '' },
    { id: '28', name: 'Colin Graham', firstName: 'Colin', lastName: 'Graham', dateAdded: '7 January 2026', type: 'Official', status: 'Pending', organisation: 'Graham & Associates', relationship: 'Solicitor', telephoneNumber1: '0141 012 3456', telephoneNumber2: '0141 012 3457' },
    { id: '29', name: 'Diane Mitchell', firstName: 'Diane', lastName: 'Mitchell', dateAdded: '5 January 2026', type: 'Social', status: 'Approved', dateOfBirth: '23 February 1989', relationship: 'Friend', addressLine1: '11 Loch View', addressLine2: '', townOrCity: 'Dumbarton', postcode: 'G82 4PQ', country: 'United Kingdom', telephoneNumber1: '01389 123 456', telephoneNumber2: '' },
    { id: '30', name: 'Steven Baird', firstName: 'Steven', lastName: 'Baird', dateAdded: '2 January 2026', type: 'Social', status: 'Approved', dateOfBirth: '6 November 1984', relationship: 'Friend', addressLine1: '36 Academy Street', addressLine2: '', townOrCity: 'Ayr', postcode: 'KA7 5QR', country: 'United Kingdom', telephoneNumber1: '01292 234 567', telephoneNumber2: '' },
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
  router.get('/pin-phone/view-contacts', async (req, res, _next) => {
    await auditService.logPageView(Page.VIEW_CONTACTS, { who: res.locals.user.username, correlationId: req.id })

    const currentPage = Number.parseInt(req.query.page as string, 10) || 0
    const pageSize = 10
    // todo: update once API is implemented
    const response = getContacts(currentPage, pageSize)

    req.session.allContacts = getContacts(0, 999).content

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
            html: `<a class="govuk-link govuk-link--no-underline" href="/pin-phone/view-contacts/${contactType}-contact/${contact.id}">${contact.name}</a>`,
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
