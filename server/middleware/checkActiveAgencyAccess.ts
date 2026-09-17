import type { RequestHandler } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import logger from '../../logger'
import { ACTIVE_AGENCIES } from '../constants/activeAgencies'
import ERROR_MESSAGE from '../constants/errorMessages'

const NO_ACTIVE_CASELOAD = '-no-active-case-load-id-'
const ENTRY_DENIED_ERROR_PAGE = { message: ERROR_MESSAGE.ENTRY_DENIED_ERROR_MESSAGE, accessDenied: true }

export default function checkActiveAgencyAccess(): RequestHandler {
  return async (_req, res, next) => {
    const user = res.locals.user as LaunchpadUser

    if (!user) {
      logger.warn('Access denied as user is missing')
      return res.status(403).render('pages/error', ENTRY_DENIED_ERROR_PAGE)
    }

    const activeCaseLoadId = user.establishment.agency_id || NO_ACTIVE_CASELOAD

    const activeAgencies = ACTIVE_AGENCIES
    const isAllowed = activeAgencies.includes(activeCaseLoadId)

    logger.info(
      `Active agency access check: activeCaseLoadId=${activeCaseLoadId}, activeAgencies=${JSON.stringify(activeAgencies)}, isAllowed=${isAllowed}`,
    )

    if (isAllowed) {
      return next()
    }

    logger.warn(
      `Access denied for user ${user.username}. activeCaseLoadId=${activeCaseLoadId}, activeAgencies=${JSON.stringify(activeAgencies)}`,
    )
    return res.status(403).render('pages/error', ENTRY_DENIED_ERROR_PAGE)
  }
}
