import { Request, Response } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import { Page } from '../../services/auditService'
import TelemetryService from '../../services/telemetryService'
import { PageHandler } from '../interfaces/pageHandler'

export default class CanteenLandingHandler implements PageHandler {
  constructor(private readonly telemetryService: TelemetryService) {}

  public PAGE_NAME = Page.CANTEEN_LANDING

  GET = async (req: Request, res: Response) => {
    const user = req.user as LaunchpadUser
    this.telemetryService.trackEvent('CANTEEN_LANDING', user, {
      prisonCode: user.establishment.agency_id,
    })

    return res.render('pages/canteen-landing', { userName: res.locals.user.displayName })
  }
}
