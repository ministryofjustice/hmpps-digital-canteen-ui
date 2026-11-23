import { RequestHandler, Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { AuditAction } from '../services/auditService'
import MedusaBasketService from '../services/medusaBasketService'
import auditMiddleware, { AuditedRequest } from '../middleware/auditMiddleware'
import { PATHS } from '../constants/paths'

/**
 * Basket actions submitted from the canteen landing page. They are not pages, so are not added with route(), but
 * each is still audited, e.g. CREATE_BASKET_ITEM_*
 */
export default function basketRoutes(
  router: Router,
  auditService: AuditService,
  medusaBasketService: MedusaBasketService,
): void {
  const audited = (path: string, audit: AuditedRequest, handler: RequestHandler) => {
    const { logAttempt, logError } = auditMiddleware(auditService, audit)
    router.post(path, logAttempt, handler, logError)
  }

  audited(
    PATHS.ADD_LINE_ITEM,
    {
      action: AuditAction.CREATE,
      target: 'BASKET_ITEM',
      details: req => ({ entityId: req.body?.productVariantId }),
    },
    async (req, res, next) => {
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
        return next(error)
      }
      return res.redirect(PATHS.LANDING_PAGE)
    },
  )

  audited(
    PATHS.REMOVE_LINE_ITEM,
    {
      action: AuditAction.DELETE,
      target: 'BASKET_ITEM',
      details: req => ({ entityId: req.body?.lineItemId }),
    },
    async (req, res, next) => {
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
          return next(error)
        }
      }
      return res.redirect(PATHS.LANDING_PAGE)
    },
  )

  audited(PATHS.REMOVE_BASKET, { action: AuditAction.DELETE, target: 'BASKET' }, async (req, res, next) => {
    if (req.session.cartId) {
      try {
        await medusaBasketService.removeBasket({
          metadata: {
            cartId: req.session.cartId,
          },
        })
      } catch (error) {
        return next(error)
      }
    }
    return res.redirect(PATHS.LANDING_PAGE)
  })
}
