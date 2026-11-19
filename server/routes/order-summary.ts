import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../services/auditService'
import { PATHS } from '../constants/paths'
import TelemetryService from '../services/telemetryService'
import CanteenService from '../services/canteenService'
import MedusaService from '../services/medusaService'
import { GetDraftOrderResponse } from '../canteen.model'

// todo: dummy page to support api testing
export default function orderSummary(
  router: Router,
  auditService: AuditService,
  telemetryService: TelemetryService,
  canteenService: CanteenService,
  medusaBasketService: MedusaService,
): Router {
  router.get(PATHS.ORDER_SUMMARY, async (req, res, _next) => {
    await auditService.logPageView(Page.CANTEEN_LANDING, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const user = req.user as LaunchpadUser
    telemetryService.trackEvent('CANTEEN_LANDING', user, {
      prisonCode: user.establishment.agency_id,
    })

    // todo: initial order details call, basic info to allow some testing, will need further changes
    let draftOrderDetails = null as GetDraftOrderResponse
    if (req.session.draftOrderId) {
      draftOrderDetails = await medusaBasketService.getOrder(req.session.draftOrderId)
    }

    return res.render('pages/order-summary', {
      draftOrderDetails,
      userName: user.username,
    })
  })

  router.post('/api/cancel-draft-order', async (req, res, _next) => {
    try {
      await medusaBasketService.cancelDraftOrder({
        data: {
          draftOrderId: req.session.draftOrderId,
        },
      })
      req.session.draftOrderId = null
    } catch (error) {
      return _next(error)
    }
    return res.redirect(PATHS.ORDER_SUMMARY)
  })

  return router
}
