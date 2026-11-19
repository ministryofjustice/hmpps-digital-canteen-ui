import { Request, Response } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import { Page } from '../../services/auditService'
import TelemetryService from '../../services/telemetryService'
import CanteenService from '../../services/canteenService'
import MedusaBasketService from '../../services/medusaBasketService'
import { PageHandler } from '../interfaces/pageHandler'

export default class CanteenLandingHandler implements PageHandler {
  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly canteenService: CanteenService,
    private readonly medusaBasketService: MedusaBasketService,
  ) {}

  public PAGE_NAME = Page.CANTEEN_LANDING

  GET = async (req: Request, res: Response) => {
    const user = req.user as LaunchpadUser
    this.telemetryService.trackEvent('CANTEEN_LANDING', user, {
      prisonCode: user.establishment.agency_id,
    })

    if (!req.session.medusaUserCreated) {
      await this.canteenService.createMedusaUser({
        metadata: {
          prisonId: user.establishment.agency_id,
          offenderNo: user.userId,
        },
      })
      req.session.medusaUserCreated = true
    }

    const basketDetails = await this.medusaBasketService.retrieveCurrentBasket({
      metadata: {
        offenderNo: user.userId,
        cartId: req.session.cartId || null,
      },
    })
    req.session.cartId = basketDetails.cartId

    return res.render('pages/canteen-landing', {
      basketDetails,
      userName: res.locals.user.displayName,
    })
  }
}
