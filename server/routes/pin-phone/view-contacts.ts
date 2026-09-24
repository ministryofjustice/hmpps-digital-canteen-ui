import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../../services/auditService'
import paginationService from '../../services/paginationService'
import config from '../../config'
import PinPhoneService from '../../services/pinPhoneService'
import { PATHS } from '../../constants/paths'
import { convertToTitleCase } from '../../utils/utils'
import { PrisonerContact } from '../../pinPhone.model'
import TelemetryService from '../../services/telemetryService'

const PAGE_SIZE = 10

export default function viewContactsRoutes(
  router: Router,
  auditService: AuditService,
  pinPhoneService: PinPhoneService,
  telemetryService: TelemetryService,
): Router {
  router.get(PATHS.VIEW_CONTACTS, async (req, res, _next) => {
    await auditService.logPageView(Page.VIEW_CONTACTS, { who: res.locals.user.username, correlationId: req.id })

    const user = req.user as LaunchpadUser
    const allContacts = await pinPhoneService.retrieveContacts(user.userId)
    req.session.allContacts = allContacts

    if (allContacts.length === 0) {
      return res.render('pages/pin-phone/view-contacts', {
        pinPhoneApps: config.prisonerAppsUrl,
        hasContacts: false,
      })
    }

    const currentPage = Number.parseInt(req.query.page as string, 10) || 0
    const { pageContacts, totalElements } = getPaginatedContacts(allContacts, currentPage)

    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    const pagination = paginationService.getPagination({ totalElements, page: currentPage, size: PAGE_SIZE }, url)
    telemetryService.trackEvent('PIN_PHONE_VIEW_CONTACTS', user, {
      prisonCode: user.establishment.agency_id,
    })
    return res.render('pages/pin-phone/view-contacts', {
      pinPhoneApps: config.prisonerAppsUrl,
      tableRows: formatContactsForTable(pageContacts),
      pagination,
      hasContacts: true,
    })
  })

  return router
}

function getPaginatedContacts(contacts: PrisonerContact[], page: number) {
  const sortedContacts = [...contacts].sort((a, b) => a.name.localeCompare(b.name))
  const start = page * PAGE_SIZE
  const end = Math.min(start + PAGE_SIZE, sortedContacts.length)

  return {
    pageContacts: sortedContacts.slice(start, end),
    totalElements: sortedContacts.length,
  }
}

function formatContactsForTable(contacts: PrisonerContact[]) {
  return contacts.map(contact => [
    { text: contact.name },
    { text: contact.phoneNumber },
    { text: convertToTitleCase(contact.contactType ?? '') },
    { text: convertToTitleCase(contact.contactTypeDescription ?? '') },
  ])
}
