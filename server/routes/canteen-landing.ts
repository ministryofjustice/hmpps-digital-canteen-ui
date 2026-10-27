import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { AuditedUserGroup, AuditOutcome, Page, SubjectType } from '../services/auditService'
import { PATHS } from '../constants/paths'
import TelemetryService from '../services/telemetryService'
import auditUserFor from '../utils/auditUser'

export default function canteenRoutes(
  router: Router,
  auditService: AuditService,
  telemetryService: TelemetryService,
): Router {
  router.get(PATHS.LANDING_PAGE, async (req, res, next) => {
    const user = req.user as LaunchpadUser

    // Prisoners view their own data on this page. Staff see no personal data here
    const { who, userGroup } = auditUserFor(user)
    const subject =
      userGroup === AuditedUserGroup.PRISONER
        ? { subjectId: who, subjectType: SubjectType.PRISONER_ID }
        : { subjectId: 'NONE', subjectType: SubjectType.NOT_APPLICABLE }

    const auditPageView = (outcome: AuditOutcome, details?: object) =>
      auditService.logPageView(
        Page.CANTEEN_LANDING,
        outcome,
        { who, ...subject, correlationId: req.id, details },
        userGroup,
      )

    await auditPageView(AuditOutcome.ATTEMPT)

    const userName = user.username
    telemetryService.trackEvent('CANTEEN_LANDING', user, {
      prisonCode: user.establishment.agency_id,
    })

    return res.render('pages/canteen-landing', { userName }, async (error: Error, html: string) => {
      if (error) {
        await auditPageView(AuditOutcome.FAILURE, { failureReason: error.message })
        return next(error)
      }
      await auditPageView(AuditOutcome.SUCCESS)
      return res.send(html)
    })
  })

  return router
}
