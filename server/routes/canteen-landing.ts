import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../services/auditService'
import { PATHS } from '../constants/paths'
import TelemetryService from '../services/telemetryService'
import CanteenService from '../services/canteenService'
import MedusaBasketService from '../services/medusaBasketService'

export default function canteenRoutes(
  router: Router,
  auditService: AuditService,
  telemetryService: TelemetryService,
  canteenService: CanteenService,
  medusaBasketService: MedusaBasketService,
): Router {
  router.get(PATHS.LANDING_PAGE, async (req, res, _next) => {
    await auditService.logPageView(Page.CANTEEN_LANDING, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const user = req.user as LaunchpadUser
    telemetryService.trackEvent('CANTEEN_LANDING', user, {
      prisonCode: user.establishment.agency_id,
    })

    if (!req.session.medusaUserCreated) {
      await canteenService.createMedusaUser({
        metadata: {
          prisonId: user.establishment.agency_id,
          offenderNo: user.userId,
        },
      })
      req.session.medusaUserCreated = true
    }

    const basketDetails = await medusaBasketService.retrieveCurrentBasket({
      metadata: {
        offenderNo: user.userId,
        cartId: req.session.cartId || null,
      },
    })
    req.session.cartId = basketDetails.cartId

    return res.render('pages/canteen-landing', {
      basketDetails,
      userName: user.username,
    })
  })

  router.post('/api/add-line-item', async (req, res, _next) => {
    const user = req.user as LaunchpadUser
    const { productVariantId } = req.body

    try {
      const cart = await medusaBasketService.addItemsToBasket({
        metadata: {
          prisonId: user.establishment.agency_id,
          offenderNo: user.userId,
          productVariantId,
          cartId: req.session.cartId || null,
        },
      })
      req.session.cartId = cart.cartId
    } catch (error) {
      return _next(error)
    }
    return res.redirect(PATHS.LANDING_PAGE)
  })

  router.post('/api/remove-line-item', async (req, res, _next) => {
    const { lineItemId, quantity } = req.body
    const newQuantity = parseInt(quantity, 10) - 1
    if (req.session.cartId) {
      try {
        await medusaBasketService.removeLineItemFromBasket({
          metadata: {
            cartId: req.session.cartId,
            lineItemId,
            quantity: newQuantity,
          },
        })
      } catch (error) {
        return _next(error)
      }
    }
    return res.redirect(PATHS.LANDING_PAGE)
  })

  router.post('/api/remove-basket', async (req, res, _next) => {
    if (req.session.cartId) {
      try {
        await medusaBasketService.removeBasket({
          metadata: {
            cartId: req.session.cartId,
          },
        })
      } catch (error) {
        return _next(error)
      }
    }
    return res.redirect(PATHS.LANDING_PAGE)
  })

  return router
}
