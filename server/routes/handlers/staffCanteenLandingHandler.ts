import { Request, Response } from 'express'
import { Page } from '../../services/auditService'
import TelemetryService from '../../services/telemetryService'
import { HmppsUser } from '../../interfaces/hmppsUser'
import { PageHandler } from '../interfaces/pageHandler'

export default class StaffCanteenLandingHandler implements PageHandler {
  constructor(private readonly telemetryService: TelemetryService) {}

  public PAGE_NAME = Page.STAFF_CANTEEN_LANDING

  GET = async (req: Request, res: Response) => {
    const user = req.user as HmppsUser
    this.telemetryService.trackEvent('STAFF_CANTEEN_LANDING', user, {})

    return res.render('pages/staff-canteen-landing', { userName: res.locals.user.displayName })
  }
}
