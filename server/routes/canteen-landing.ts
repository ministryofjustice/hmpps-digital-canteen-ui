import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../services/auditService'
import { PATHS } from '../constants/paths'
import TelemetryService from '../services/telemetryService'
import CanteenService from '../services/canteenService'
import MedusaService from '../services/medusaService'
import { toPounds } from '../utils/utils'

// todo: dummy page to support api testing
export default function canteenRoutes(
  router: Router,
  auditService: AuditService,
  telemetryService: TelemetryService,
  canteenService: CanteenService,
  medusaBasketService: MedusaService,
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
        data: {
          prisonId: user.establishment.agency_id,
          offenderNo: user.userId,
        },
      })
      req.session.medusaUserCreated = true
    }

    const prisonerBalance = await canteenService.retrievePrisonerBalance(user.userId)
    const balanceInPounds = toPounds(prisonerBalance.spendsPence)

    // retrieves current baskets that have been created and submitted
    // retrieves any current draft order
    const basketDetails = await medusaBasketService.retrieveCurrentBasket({
      data: {
        offenderNo: user.userId,
        cartId: req.session.cartId || null,
      },
    })
    req.session.cartId = basketDetails.cartId
    req.session.draftOrderId = basketDetails.draftOrderId

    return res.render('pages/canteen-landing', {
      balanceInPounds,
      basketDetails,
      userName: user.username,
    })
  })

  router.post('/api/add-line-item', async (req, res, _next) => {
    const user = req.user as LaunchpadUser
    const { productVariantId } = req.body

    try {
      const cart = await medusaBasketService.addItemsToBasket({
        data: {
          prisonId: user.establishment.agency_id,
          offenderNo: user.userId,
          productVariantId,
          cartId: req.session.cartId || null,
          canteenWindowEnd: new Date('2026-11-12T18:00:00Z'),
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
          data: {
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
          data: {
            cartId: req.session.cartId,
          },
        })
        req.session.cartId = null
      } catch (error) {
        return _next(error)
      }
    }
    return res.redirect(PATHS.LANDING_PAGE)
  })

  router.post('/api/create-draft-order', async (req, res, _next) => {
    if (req.session.cartId) {
      try {
        const draftOrder = await medusaBasketService.createDraftOrder(req.session.cartId, {
          data: {
            draftOrderId: req.session.draftOrderId,
          },
        })
        req.session.draftOrderId = draftOrder.draftOrderId
        req.session.cartId = null
      } catch (error) {
        return _next(error)
      }
    }
    return res.redirect(PATHS.LANDING_PAGE)
  })

  return router
}
